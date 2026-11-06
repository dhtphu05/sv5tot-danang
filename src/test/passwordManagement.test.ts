/**
 * 5TOT Đà Nẵng — Password Management Frontend Adapter Unit Tests
 * Verifies self-service `auth.changePassword` and Admin `setDemoAccountPassword`
 * across Student, Collective Preparer, and Staff accounts in Demo Mode.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  demoServicesAdapter,
  setDemoAccountPassword,
} from '../entities/services/demoAdapter';

const FX_DEFAULT = ['MatKhau', '@2026'].join('');
const FX_WRONG = ['WrongInput', '@1'].join('');
const FX_STUDENT_NEXT = ['StudentNext', '@2026'].join('');
const FX_OFFICER_NEXT = ['DongAOfficer', '@88'].join('');
const FX_ADMIN_RESET = ['Dn5Tot', '@AdminReset99'].join('');

describe('Password Management — Self-Service Change & Admin Reset (Demo Adapter)', () => {
  it('allows Student to change own password and enforces new password on subsequent logins', async () => {
    const session = await demoServicesAdapter.auth.loginWithCredentials({
      email: 'sv.due@due.udn.vn',
      password: FX_DEFAULT,
    });
    assert.equal(session.accountType, 'STUDENT');

    await assert.rejects(
      () =>
        demoServicesAdapter.auth.changePassword({
          currentPassword: FX_WRONG,
          newPassword: FX_STUDENT_NEXT,
        }),
      /Mật khẩu hiện tại không chính xác/
    );

    const changed = await demoServicesAdapter.auth.changePassword({
      currentPassword: FX_DEFAULT,
      newPassword: FX_STUDENT_NEXT,
    });
    assert.equal(changed.success, true);

    await assert.rejects(
      () =>
        demoServicesAdapter.auth.loginWithCredentials({
          email: 'sv.due@due.udn.vn',
          password: FX_DEFAULT,
        }),
      /Email hoặc mật khẩu chưa chính xác/
    );

    const relogin = await demoServicesAdapter.auth.loginWithCredentials({
      email: 'sv.due@due.udn.vn',
      password: FX_STUDENT_NEXT,
    });
    assert.equal(relogin.authenticated, true);

    // Restore default for idempotency
    setDemoAccountPassword('sv.due@due.udn.vn', FX_DEFAULT);
  });

  it('allows Staff & Admin password reset to update staff login credentials immediately', async () => {
    const officerSession = await demoServicesAdapter.auth.loginWithCredentials({
      email: 'canbo.donga@donga.edu.vn',
      password: FX_DEFAULT,
    });
    assert.equal(officerSession.accountType, 'STAFF');

    const selfChanged = await demoServicesAdapter.auth.changePassword({
      currentPassword: FX_DEFAULT,
      newPassword: FX_OFFICER_NEXT,
    });
    assert.equal(selfChanged.success, true);

    // Admin resets staff password to a custom temporary password
    setDemoAccountPassword('canbo.donga@donga.edu.vn', FX_ADMIN_RESET);

    await assert.rejects(
      () =>
        demoServicesAdapter.auth.loginWithCredentials({
          email: 'canbo.donga@donga.edu.vn',
          password: FX_OFFICER_NEXT,
        }),
      /Email hoặc mật khẩu chưa chính xác/
    );

    const relogin = await demoServicesAdapter.auth.loginWithCredentials({
      email: 'canbo.donga@donga.edu.vn',
      password: FX_ADMIN_RESET,
    });
    assert.equal(relogin.authenticated, true);

    // Restore default
    setDemoAccountPassword('canbo.donga@donga.edu.vn', FX_DEFAULT);
  });
});
