/**
 * 5TOT Đà Nẵng — Session Domain Service Unit Tests (BE2-A)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { SessionService } from '../../src/modules/sessions/session.service';
import { FakeSessionRepository } from '../fakes/fakeSessionRepository';
import { FakeIdentityRepository } from '../fakes/fakeIdentityRepository';
import { ApiError } from '../../src/shared/errors/apiError';
import { UserEntity } from '../../src/modules/identity/identity.types';

describe('Backend V2: Session Domain Service Unit Tests', () => {
  let fakeSessionRepo: FakeSessionRepository;
  let fakeIdentityRepo: FakeIdentityRepository;
  let sessionService: SessionService;
  let mockUser: UserEntity;

  beforeEach(async () => {
    fakeSessionRepo = new FakeSessionRepository();
    fakeIdentityRepo = new FakeIdentityRepository();
    sessionService = new SessionService(fakeSessionRepo, fakeIdentityRepo);

    mockUser = await fakeIdentityRepo.createStudent({
      email: 'student.session@dut.udn.vn',
      passwordHash: 'argon2-hash',
      fullName: 'Trần Văn Session',
      studentCode: '102220099',
      institutionId: 'inst-dut-danang',
    });
  });

  it('creates an active session, issues signed access token and hashed refresh token', async () => {
    const tokens = await sessionService.createSession(
      mockUser,
      ['STUDENT'],
      'STUDENT',
      { userAgent: 'Mozilla/5.0', ipAddress: '127.0.0.1' }
    );

    assert.ok(tokens.accessToken);
    assert.ok(tokens.refreshToken);
    assert.equal(tokens.tokenType, 'Bearer');

    // Verify access token claims
    const claims = sessionService.verifyAccessToken(tokens.accessToken);
    assert.equal(claims.sub, mockUser.id);
    assert.equal(claims.email, mockUser.email);
    assert.deepEqual(claims.roles, ['STUDENT']);
    assert.equal(claims.activeRole, 'STUDENT');
    assert.ok(claims.tokenFamilyId);
    assert.ok(claims.sessionId);

    // Verify session stored in repo has hashed token, NOT raw plaintext
    const hashed = sessionService.hashRefreshToken(tokens.refreshToken);
    const sessionInRepo = await fakeSessionRepo.findByRefreshTokenHash(hashed);
    assert.ok(sessionInRepo);
    assert.equal(sessionInRepo.userId, mockUser.id);
    assert.equal(sessionInRepo.revokedAt, null);
  });

  it('rotates refresh token and maintains tokenFamilyId', async () => {
    const initialTokens = await sessionService.createSession(
      mockUser,
      ['STUDENT'],
      'STUDENT'
    );

    const rotatedTokens = await sessionService.rotateRefreshToken(
      initialTokens.refreshToken,
      { userAgent: 'Chrome/120' }
    );

    assert.ok(rotatedTokens.accessToken);
    assert.ok(rotatedTokens.refreshToken);
    assert.notEqual(initialTokens.refreshToken, rotatedTokens.refreshToken);

    // Old session should be marked ROTATED
    const oldHash = sessionService.hashRefreshToken(initialTokens.refreshToken);
    const oldSession = await fakeSessionRepo.findByRefreshTokenHash(oldHash);
    assert.ok(oldSession);
    assert.ok(oldSession.revokedAt !== null);
    assert.equal(oldSession.revokeReason, 'ROTATED');

    // New session should be active and share the exact same tokenFamilyId
    const newHash = sessionService.hashRefreshToken(rotatedTokens.refreshToken);
    const newSession = await fakeSessionRepo.findByRefreshTokenHash(newHash);
    assert.ok(newSession);
    assert.equal(newSession.revokedAt, null);
    assert.equal(newSession.tokenFamilyId, oldSession.tokenFamilyId);
  });

  it('CRITICAL: detects refresh token replay attack and revokes entire token family', async () => {
    // 1. Initial login
    const initialTokens = await sessionService.createSession(
      mockUser,
      ['STUDENT'],
      'STUDENT'
    );

    // 2. Legitimate user rotates token (Gen 1 -> Gen 2)
    const gen2Tokens = await sessionService.rotateRefreshToken(initialTokens.refreshToken);
    assert.ok(gen2Tokens.refreshToken);

    // 3. Legitimate user rotates token again (Gen 2 -> Gen 3)
    const gen3Tokens = await sessionService.rotateRefreshToken(gen2Tokens.refreshToken);
    assert.ok(gen3Tokens.refreshToken);

    // 4. ATTACK SCENARIO: Malicious actor (or leaked cache) attempts to replay the already-used Gen 1 token!
    await assert.rejects(
      async () => {
        await sessionService.rotateRefreshToken(initialTokens.refreshToken);
      },
      (err: any) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 401);
        assert.equal(err.code, 'REFRESH_TOKEN_REPLAY_DETECTED');
        assert.ok(err.message.includes('Phát hiện tái sử dụng phiên'));
        return true;
      }
    );

    // 5. Verify the entire token family was revoked! Gen 3 session must now be revoked too!
    const gen3Hash = sessionService.hashRefreshToken(gen3Tokens.refreshToken);
    const gen3Session = await fakeSessionRepo.findByRefreshTokenHash(gen3Hash);
    assert.ok(gen3Session);
    assert.ok(gen3Session.revokedAt !== null);
    assert.equal(gen3Session.revokeReason, 'REPLAY_DETECTED');
  });

  it('rejects rotation of completely invalid refresh token', async () => {
    await assert.rejects(
      async () => {
        await sessionService.rotateRefreshToken('non-existent-random-token-123456');
      },
      (err: any) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 401);
        assert.equal(err.code, 'INVALID_REFRESH_TOKEN');
        return true;
      }
    );
  });

  it('revokes session on user logout', async () => {
    const tokens = await sessionService.createSession(
      mockUser,
      ['STUDENT'],
      'STUDENT'
    );

    await sessionService.logout(tokens.refreshToken);

    const hash = sessionService.hashRefreshToken(tokens.refreshToken);
    const session = await fakeSessionRepo.findByRefreshTokenHash(hash);
    assert.ok(session);
    assert.ok(session.revokedAt !== null);
    assert.equal(session.revokeReason, 'USER_LOGOUT');
  });

  it('revokes all user sessions on password reset', async () => {
    // User logged in from 2 devices
    const device1 = await sessionService.createSession(mockUser, ['STUDENT'], 'STUDENT');
    const device2 = await sessionService.createSession(mockUser, ['STUDENT'], 'STUDENT');

    const revokedCount = await sessionService.revokeAllUserSessions(mockUser.id, 'PASSWORD_RESET');
    assert.equal(revokedCount, 2);

    const hash1 = sessionService.hashRefreshToken(device1.refreshToken);
    const hash2 = sessionService.hashRefreshToken(device2.refreshToken);
    const session1 = await fakeSessionRepo.findByRefreshTokenHash(hash1);
    const session2 = await fakeSessionRepo.findByRefreshTokenHash(hash2);

    assert.equal(session1?.revokeReason, 'PASSWORD_RESET');
    assert.equal(session2?.revokeReason, 'PASSWORD_RESET');
  });
});
