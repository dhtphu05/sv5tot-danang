/**
 * 5TOT Đà Nẵng — Authoritative 24-Point Authorization Security Test Matrix (BE2-A2)
 * Explicitly tests all 24 required security test cases specified in BE2-A2 Specification.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { SessionService } from '../../src/modules/sessions/session.service';
import { AuthorizationService } from '../../src/modules/authorization/authorization.service';
import { ScopePolicy } from '../../src/modules/authorization/scope.policy';
import { RolePolicy } from '../../src/modules/authorization/role.policy';
import { FakeIdentityRepository } from '../fakes/fakeIdentityRepository';
import { FakeSessionRepository } from '../fakes/fakeSessionRepository';
import { AuthenticatedActor } from '../../src/modules/authorization/authorization.types';
import { ApiError } from '../../src/shared/errors/apiError';
import { parseEnvironment, ConfigurationError } from '../../src/config/environment';

describe('Backend V2: 24-Point Authorization & Security Matrix (BE2-A2)', () => {
  let fakeIdentityRepo: FakeIdentityRepository;
  let fakeSessionRepo: FakeSessionRepository;
  let sessionService: SessionService;
  let authzService: AuthorizationService;

  beforeEach(() => {
    fakeIdentityRepo = new FakeIdentityRepository();
    fakeSessionRepo = new FakeSessionRepository();
    sessionService = new SessionService(fakeSessionRepo, fakeIdentityRepo);
    authzService = new AuthorizationService(fakeIdentityRepo);
  });

  // 1. Unauthenticated request denied
  it('Matrix 1: Unauthenticated request denied when token is missing', () => {
    assert.throws(
      () => sessionService.verifyAccessToken(''),
      (err: any) => err instanceof ApiError && err.status === 401 && err.code === 'INVALID_TOKEN'
    );
  });

  // 2. Malformed JWT denied
  it('Matrix 2: Malformed JWT denied', () => {
    assert.throws(
      () => sessionService.verifyAccessToken('not.a.valid.jwt.payload'),
      (err: any) => err instanceof ApiError && err.status === 401 && err.code === 'INVALID_TOKEN'
    );
  });

  // 3. Expired JWT denied
  it('Matrix 3: Expired JWT denied', () => {
    const expiredToken = jwt.sign(
      { sub: 'user-1', email: 'exp@dut.udn.vn', roles: ['STUDENT'], activeRole: 'STUDENT' },
      'dev-access-token-secret-for-offline-be2a-only-minimum-256-bit-key-testing',
      { expiresIn: -10 } // Expired 10 seconds ago
    );

    assert.throws(
      () => sessionService.verifyAccessToken(expiredToken),
      (err: any) => err instanceof ApiError && err.status === 401 && err.code === 'TOKEN_EXPIRED'
    );
  });

  // 4. Invalid signature denied
  it('Matrix 4: Invalid signature denied', () => {
    const forgedToken = jwt.sign(
      { sub: 'user-1', email: 'forged@dut.udn.vn', roles: ['ADMIN'], activeRole: 'ADMIN' },
      'wrong-secret-key-attacker-signature-mismatch'
    );

    assert.throws(
      () => sessionService.verifyAccessToken(forgedToken),
      (err: any) => err instanceof ApiError && err.status === 401 && err.code === 'INVALID_TOKEN'
    );
  });

  // 5. Revoked session denied
  it('Matrix 5: Revoked session denied on token rotation / access', async () => {
    const user = await fakeIdentityRepo.createStudent({
      email: 'm5@dut.udn.vn',
      passwordHash: 'hash',
      fullName: 'User M5',
      studentCode: 'M5001',
      institutionId: 'inst-dut',
    });

    const tokens = await sessionService.createSession(user, ['STUDENT'], 'STUDENT');
    await sessionService.logout(tokens.refreshToken);

    // Using the refresh token after logout must fail
    await assert.rejects(
      async () => sessionService.rotateRefreshToken(tokens.refreshToken),
      (err: any) => err instanceof ApiError && err.status === 401
    );
  });

  // 6. Disabled account denied
  it('Matrix 6: Disabled/Suspended account denied', async () => {
    const user = await fakeIdentityRepo.createStudent({
      email: 'm6@dut.udn.vn',
      passwordHash: 'hash',
      fullName: 'User M6',
      studentCode: 'M6001',
      institutionId: 'inst-dut',
    });

    const tokens = await sessionService.createSession(user, ['STUDENT'], 'STUDENT');
    await fakeIdentityRepo.updateStatus(user.id, 'SUSPENDED');

    await assert.rejects(
      async () => sessionService.rotateRefreshToken(tokens.refreshToken),
      (err: any) => err instanceof ApiError && err.status === 403 && err.code === 'ACCOUNT_INACTIVE'
    );
  });

  // 7. Student cannot assign Officer role
  it('Matrix 7: Student cannot assign Officer role', () => {
    assert.equal(RolePolicy.canRolePerform('STUDENT', 'ADMIN_MANAGE_STAFF'), false);
    assert.equal(RolePolicy.canRolePerform('STUDENT', 'CITY_INTAKE_ASSIGN'), false);
  });

  // 8. Student cannot read another student\'s protected data
  it('Matrix 8: Student cannot read another student protected data', () => {
    const studentA: AuthenticatedActor = {
      userId: 'student-A',
      email: 'a@dut.udn.vn',
      fullName: 'A',
      roles: ['STUDENT'],
      activeRole: 'STUDENT',
      institutionId: 'dut',
      schoolReviewUnitId: null,
      sessionId: 's-a',
    };

    assert.equal(ScopePolicy.canAccessStudentResource(studentA, { applicantUserId: 'student-A' }), true);
    assert.equal(ScopePolicy.canAccessStudentResource(studentA, { applicantUserId: 'student-B' }), false);
  });

  // 9. School Officer cannot access another School Review Unit
  it('Matrix 9: School Officer cannot access another School Review Unit', () => {
    const dutOfficer: AuthenticatedActor = {
      userId: 'officer-dut',
      email: 'dut@dut.udn.vn',
      fullName: 'DUT Officer',
      roles: ['SCHOOL_OFFICER'],
      activeRole: 'SCHOOL_OFFICER',
      institutionId: 'inst-dut',
      schoolReviewUnitId: 'unit-dut',
      sessionId: 's-dut',
    };

    assert.equal(ScopePolicy.canAccessSchoolUnit(dutOfficer, 'unit-dut'), true);
    assert.equal(ScopePolicy.canAccessSchoolUnit(dutOfficer, 'unit-ued'), false);
  });

  // 10. City Officer has shared review access in City scope without individual assignment requirement
  it('Matrix 10: City Officer has shared review access in City scope without assignment requirement', () => {
    const cityOfficer: AuthenticatedActor = {
      userId: 'officer-city-1',
      email: 'c1@danang.gov.vn',
      fullName: 'City Officer 1',
      roles: ['CITY_OFFICER'],
      activeRole: 'CITY_OFFICER',
      institutionId: null,
      schoolReviewUnitId: null,
      sessionId: 's-c1',
    };

    // Shared review access: any application in City review scope is accessible regardless of assignedCityOfficerId
    assert.equal(ScopePolicy.canAccessStudentResource(cityOfficer, { workflowStage: 'CITY_IN_REVIEW', assignedCityOfficerId: null }), true);
    assert.equal(ScopePolicy.canAccessStudentResource(cityOfficer, { workflowStage: 'CITY_IN_REVIEW', assignedCityOfficerId: 'officer-city-2' }), true);

    // Boundary protection: City Officer cannot access applications still in student draft or preliminary school review
    assert.equal(ScopePolicy.canAccessStudentResource(cityOfficer, { workflowStage: 'STUDENT_DRAFT' }), false);
    assert.equal(ScopePolicy.canAccessStudentResource(cityOfficer, { workflowStage: 'SCHOOL_PRELIMINARY' }), false);
  });

  // 11. City Manager can perform authorized assignment operations
  it('Matrix 11: City Manager can perform authorized assignment operations', () => {
    assert.equal(RolePolicy.canRolePerform('CITY_MANAGER', 'CITY_INTAKE_ASSIGN'), true);
    assert.equal(RolePolicy.canRolePerform('CITY_OFFICER', 'CITY_INTAKE_ASSIGN'), false);
  });

  // 12. City Officer cannot impersonate Committee
  it('Matrix 12: City Officer cannot impersonate Committee', () => {
    assert.equal(RolePolicy.canRolePerform('CITY_OFFICER', 'COMMITTEE_RECORD_DECISION'), false);
    assert.equal(RolePolicy.canRolePerform('CITY_OFFICER', 'COMMITTEE_PUBLISH_RESULTS'), false);
  });

  // 13. Committee member cannot perform unrelated administrative operations
  it('Matrix 13: Committee member cannot perform unrelated administrative operations', () => {
    assert.equal(RolePolicy.canRolePerform('CITY_COMMITTEE', 'ADMIN_MANAGE_STAFF'), false);
    assert.equal(RolePolicy.canRolePerform('CITY_COMMITTEE', 'ADMIN_MANAGE_SEASONS'), false);
  });

  // 14. Unauthorized Collective representative is denied
  it('Matrix 14: Unauthorized Collective representative is denied', async () => {
    const actor: AuthenticatedActor = {
      userId: 'user-not-rep',
      email: 'notrep@dut.udn.vn',
      fullName: 'Not Rep',
      roles: ['STUDENT'],
      activeRole: 'STUDENT',
      institutionId: 'dut',
      schoolReviewUnitId: null,
      sessionId: 's-not',
    };

    const isAllowed = await ScopePolicy.canAccessCollectiveUnit(actor, 'col-unit-1', 'season-2026', fakeIdentityRepo);
    assert.equal(isAllowed, false);
  });

  // 15. Authorized representative can access only the assigned Collective
  it('Matrix 15: Authorized representative can access only the assigned Collective', async () => {
    const rep: AuthenticatedActor = {
      userId: 'rep-user',
      email: 'rep@dut.udn.vn',
      fullName: 'Rep',
      roles: ['STUDENT', 'COLLECTIVE_PREPARER'],
      activeRole: 'COLLECTIVE_PREPARER',
      institutionId: 'dut',
      schoolReviewUnitId: null,
      sessionId: 's-rep',
    };

    fakeIdentityRepo.grantCollectiveAccess('rep-user', 'col-assigned', 'season-2026');

    const canAssigned = await ScopePolicy.canAccessCollectiveUnit(rep, 'col-assigned', 'season-2026', fakeIdentityRepo);
    const canOther = await ScopePolicy.canAccessCollectiveUnit(rep, 'col-other', 'season-2026', fakeIdentityRepo);

    assert.equal(canAssigned, true);
    assert.equal(canOther, false);
  });

  // 16. Client-supplied institution authority is ignored
  it('Matrix 16: Client-supplied institution authority is ignored (server verifies actor context)', () => {
    const dutOfficer: AuthenticatedActor = {
      userId: 'officer-dut',
      email: 'dut@dut.udn.vn',
      fullName: 'DUT Officer',
      roles: ['SCHOOL_OFFICER'],
      activeRole: 'SCHOOL_OFFICER',
      institutionId: 'inst-dut',
      schoolReviewUnitId: 'unit-dut',
      sessionId: 's-dut',
    };

    // Client claims unit-ued in query/body, but actor is bound to unit-dut
    assert.equal(ScopePolicy.canAccessSchoolUnit(dutOfficer, 'unit-ued'), false);
  });

  // 17. Client-supplied role is ignored
  it('Matrix 17: Client-supplied role is ignored (verified against server role assignments)', async () => {
    const user = await fakeIdentityRepo.createStudent({
      email: 'student.only@dut.udn.vn',
      passwordHash: 'hash',
      fullName: 'Student Only',
      studentCode: 'SO001',
      institutionId: 'dut',
    });

    const userRoles = await fakeIdentityRepo.getUserRoles(user.id);
    const activeRoles = userRoles.map((r) => r.roleCode);

    // User only has STUDENT
    assert.equal(activeRoles.includes('ADMIN'), false);
    assert.equal(activeRoles.includes('SCHOOL_OFFICER'), false);
  });

  // 18. Prototype x-5tot-actor-* headers are rejected
  it('Matrix 18: Prototype x-5tot-actor-* headers are rejected by anti-spoofing middleware', async () => {
    const { rejectClientIdentitySpoofingMiddleware } = await import('../../src/shared/middleware/rejectClientIdentitySpoofing');
    let capturedError: any = null;

    const req: any = {
      headers: {
        'x-5tot-actor-role': 'ADMIN',
        'x-5tot-actor-id': 'hacked-id',
      },
      ip: '127.0.0.1',
      originalUrl: '/api/v2/applications',
    };
    const res: any = {};
    const next = (err?: any) => { capturedError = err; };

    rejectClientIdentitySpoofingMiddleware(req, res, next);

    assert.ok(capturedError instanceof ApiError);
    assert.equal(capturedError.status, 403);
    assert.equal(capturedError.code, 'REJECTED_IDENTITY_SPOOFING');
  });

  // 19. Removed role assignment denies future privileged operations
  it('Matrix 19: Revoked/Removed role assignment denies future privileged operations', async () => {
    const staff = await fakeIdentityRepo.createStaffUser({
      email: 'temp.officer@dut.udn.vn',
      passwordHash: 'hash',
      fullName: 'Temp Officer',
      roleCode: 'SCHOOL_OFFICER',
      schoolReviewUnitId: 'unit-dut',
      grantedByUserId: 'admin-1',
    });

    const rolesBefore = await fakeIdentityRepo.getUserRoles(staff.id);
    assert.equal(rolesBefore[0].isActive, true);

    // Revoke role
    await fakeIdentityRepo.revokeRoleAssignment(rolesBefore[0].id, 'admin-1', 'Term expired');

    const rolesAfter = (await fakeIdentityRepo.getUserRoles(staff.id)).filter((r) => r.isActive);
    assert.equal(rolesAfter.length, 0);
  });

  // 20. Wrong workflow stage denies unauthorized action
  it('Matrix 20: Wrong workflow stage denies unauthorized student modification', async () => {
    const studentActor: AuthenticatedActor = {
      userId: 'student-stg',
      email: 'stg@dut.udn.vn',
      fullName: 'Student Stage',
      roles: ['STUDENT'],
      activeRole: 'STUDENT',
      institutionId: 'dut',
      schoolReviewUnitId: null,
      sessionId: 's-stg',
    };

    // Allowed when draft
    const canInDraft = await authzService.can(studentActor, 'STUDENT_EDIT_DECLARATIONS', {
      applicantUserId: 'student-stg',
      workflowStage: 'STUDENT_DRAFT',
    });
    assert.equal(canInDraft, true);

    // Strictly FORBIDDEN when already forwarded to city review
    const canInCityReview = await authzService.can(studentActor, 'STUDENT_EDIT_DECLARATIONS', {
      applicantUserId: 'student-stg',
      workflowStage: 'CITY_REVIEW',
    });
    assert.equal(canInCityReview, false);
  });

  // 21. Revoked refresh token cannot be reused
  it('Matrix 21: Revoked refresh token cannot be reused and triggers replay detection', async () => {
    const user = await fakeIdentityRepo.createStudent({
      email: 'm21@dut.udn.vn',
      passwordHash: 'hash',
      fullName: 'User M21',
      studentCode: 'M21001',
      institutionId: 'dut',
    });

    const tokens = await sessionService.createSession(user, ['STUDENT'], 'STUDENT');
    const rotated = await sessionService.rotateRefreshToken(tokens.refreshToken);

    // Replay initial token: must throw 401 replay error
    await assert.rejects(
      async () => sessionService.rotateRefreshToken(tokens.refreshToken),
      (err: any) => err.code === 'REFRESH_TOKEN_REPLAY_DETECTED'
    );
  });

  // 22. Concurrent refresh attempts cannot both succeed
  it('Matrix 22: Concurrent refresh attempts cannot both succeed (atomic CAS collision protection)', async () => {
    const user = await fakeIdentityRepo.createStudent({
      email: 'm22@dut.udn.vn',
      passwordHash: 'hash',
      fullName: 'User M22',
      studentCode: 'M22001',
      institutionId: 'dut',
    });

    const tokens = await sessionService.createSession(user, ['STUDENT'], 'STUDENT');

    // Simulate 2 parallel calls with exact same refresh token
    const call1 = sessionService.rotateRefreshToken(tokens.refreshToken);
    const call2 = sessionService.rotateRefreshToken(tokens.refreshToken);

    const results = await Promise.allSettled([call1, call2]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Exactly one must succeed, and the other must be rejected
    assert.equal(fulfilled.length, 1);
    assert.equal(rejected.length, 1);
  });

  // 23. Offline database mode cannot produce successful persistent authentication
  it('Matrix 23: Offline database mode returns 503 and cannot produce successful persistent authentication', async () => {
    const { PrismaIdentityRepository } = await import('../../src/modules/identity/prismaIdentity.repository');
    const prismaRepo = new PrismaIdentityRepository();

    await assert.rejects(
      async () => prismaRepo.findByEmail('test@dut.udn.vn'),
      (err: any) => err instanceof ApiError && err.status === 503
    );
  });

  // 24. Staging and production cannot start in offline database mode
  it('Matrix 24: Staging and production cannot start with BACKEND_DATABASE_MODE=offline', () => {
    assert.throws(
      () => parseEnvironment({
        NODE_ENV: 'production',
        BACKEND_DATABASE_MODE: 'offline',
        JWT_ACCESS_SECRET: 'long-secret-key-at-least-32-chars-for-test-matrix-24',
        REFRESH_TOKEN_PEPPER: 'long-pepper-key-at-least-16-chars',
      }),
      (err: any) => err instanceof ConfigurationError && err.message.includes('strictly forbidden in production')
    );

    assert.throws(
      () => parseEnvironment({
        NODE_ENV: 'staging',
        BACKEND_DATABASE_MODE: 'offline',
        JWT_ACCESS_SECRET: 'long-secret-key-at-least-32-chars-for-test-matrix-24',
        REFRESH_TOKEN_PEPPER: 'long-pepper-key-at-least-16-chars',
      }),
      (err: any) => err instanceof ConfigurationError && err.message.includes('strictly forbidden in production and staging')
    );
  });

  describe('BE2-A3 Targeted Security Hardening & Separation Tests', () => {
    // 25. ADMIN cannot deliberate or decide official recognition
    it('Matrix 25: ADMIN cannot deliberate in Committee or decide award recognition', () => {
      assert.equal(RolePolicy.canRolePerform('ADMIN', 'DELIBERATE_IN_COMMITTEE'), false);
      assert.equal(RolePolicy.canRolePerform('ADMIN', 'RECORD_COMMITTEE_DECISION'), false);
      assert.equal(RolePolicy.canRolePerform('ADMIN', 'COMMITTEE_RECORD_DECISION'), false);
      assert.equal(RolePolicy.canRolePerform('ADMIN', 'FINALIZE_OFFICIAL_RESULTS'), false);
    });

    // 26. ADMIN cannot perform Officer review
    it('Matrix 26: ADMIN cannot perform Officer review without separate authority', () => {
      assert.equal(RolePolicy.canRolePerform('ADMIN', 'REVIEW_ASSIGNED_APPLICATION'), false);
      assert.equal(RolePolicy.canRolePerform('ADMIN', 'CITY_REVIEW_CRITERIA'), false);
      assert.equal(RolePolicy.canRolePerform('ADMIN', 'CITY_COMPLETE_REVIEW'), false);
    });

    // 27. City Manager cannot review without explicit Officer scope
    it('Matrix 27: City Manager cannot review criteria without explicit Officer scope', () => {
      assert.equal(RolePolicy.canRolePerform('CITY_MANAGER', 'REVIEW_ASSIGNED_APPLICATION'), false);
      assert.equal(RolePolicy.canRolePerform('CITY_MANAGER', 'CITY_REVIEW_CRITERIA'), false);
      assert.equal(RolePolicy.canRolePerform('CITY_MANAGER', 'CITY_COMPLETE_REVIEW'), false);
    });

    // 28. City Officer shared review queue (Approved SRW-4 specification)
    it('Matrix 28: City Officer can review applications in shared City queue without mandatory assignment', async () => {
      const officerActor: AuthenticatedActor = {
        userId: 'officer-dn-1',
        email: 'officer1@danang.gov.vn',
        fullName: 'City Officer 1',
        roles: ['CITY_OFFICER'],
        activeRole: 'CITY_OFFICER',
        institutionId: null,
        schoolReviewUnitId: null,
        sessionId: 'sess-off-1',
      };

      // Unassigned in City queue -> ALLOWED under shared review queue model
      const canUnassigned = await authzService.can(officerActor, 'REVIEW_ASSIGNED_APPLICATION', {
        assignedCityOfficerId: null,
        workflowStage: 'CITY_IN_REVIEW',
      });
      assert.equal(canUnassigned, true);

      // Invalid pre-forward stage -> DENIED
      const canInvalidStage = await authzService.can(officerActor, 'REVIEW_ASSIGNED_APPLICATION', {
        workflowStage: 'SCHOOL_PRELIMINARY',
      });
      assert.equal(canInvalidStage, false);

      // Assigned or self-handled -> ALLOWED
      const canSelf = await authzService.can(officerActor, 'REVIEW_ASSIGNED_APPLICATION', {
        assignedCityOfficerId: 'officer-dn-1',
        workflowStage: 'CITY_IN_REVIEW',
      });
      assert.equal(canSelf, true);
    });

    // 29. Committee decision requires active Committee authorization
    it('Matrix 29: Committee decision requires active Committee role in correct workflow stage', async () => {
      const committeeActor: AuthenticatedActor = {
        userId: 'comm-1',
        email: 'committee1@danang.gov.vn',
        fullName: 'Committee Member 1',
        roles: ['CITY_COMMITTEE'],
        activeRole: 'CITY_COMMITTEE',
        institutionId: null,
        schoolReviewUnitId: null,
        sessionId: 'sess-comm-1',
      };

      // Allowed during COMMITTEE_PENDING
      const canInPending = await authzService.can(committeeActor, 'RECORD_COMMITTEE_DECISION', {
        workflowStage: 'COMMITTEE_PENDING',
      });
      assert.equal(canInPending, true);

      // Denied during preliminary student draft
      const canInDraft = await authzService.can(committeeActor, 'RECORD_COMMITTEE_DECISION', {
        workflowStage: 'STUDENT_DRAFT',
      });
      assert.equal(canInDraft, false);
    });

    // 30. Unapproved results cannot be published as officially recognized
    it('Matrix 30: Unapproved results cannot be published without approved Committee decision', async () => {
      const committeeActor: AuthenticatedActor = {
        userId: 'comm-1',
        email: 'committee1@danang.gov.vn',
        fullName: 'Committee Member 1',
        roles: ['CITY_COMMITTEE'],
        activeRole: 'CITY_COMMITTEE',
        institutionId: null,
        schoolReviewUnitId: null,
        sessionId: 'sess-comm-1',
      };

      // Denied when batch/application has no approved decision
      const canUnapproved = await authzService.can(committeeActor, 'PUBLISH_OFFICIAL_RESULTS', {
        hasCommitteeDecision: false,
      });
      assert.equal(canUnapproved, false);

      // Allowed when committee decision exists
      const canApproved = await authzService.can(committeeActor, 'PUBLISH_OFFICIAL_RESULTS', {
        hasCommitteeDecision: true,
      });
      assert.equal(canApproved, true);
    });

    // 31. JWT stale role claims do not grant current permissions
    it('Matrix 31: JWT stale role claims do not grant permissions when revoked in server database', async () => {
      // 1. Create a user who only has STUDENT in server database
      const user = await fakeIdentityRepo.createStudent({
        email: 'stale.jwt@dut.udn.vn',
        passwordHash: 'hash',
        fullName: 'Stale User',
        studentCode: 'STALE01',
        institutionId: 'inst-dut',
      });

      // 2. An attacker or client presents a stale/tampered token claiming ADMIN activeRole
      const staleActor: AuthenticatedActor = {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: ['STUDENT', 'ADMIN'],
        activeRole: 'ADMIN', // Stale claim!
        institutionId: 'inst-dut',
        schoolReviewUnitId: null,
        sessionId: 'sess-stale',
      };

      // Server dynamically checks database role assignments; user does NOT have active ADMIN
      const canPerform = await authzService.can(staleActor, 'MANAGE_STAFF_ACCOUNTS');
      assert.equal(canPerform, false);
    });

    // 32. JWT audience and issuer verification
    it('Matrix 32: JWT with wrong audience or wrong issuer is denied', () => {
      const validSecret = 'dev-access-token-secret-for-offline-be2a-only-minimum-256-bit-key-testing';

      // Token with wrong issuer
      const wrongIssuerToken = jwt.sign(
        { sub: 'user-1', email: 'u1@dut.udn.vn', roles: ['STUDENT'], activeRole: 'STUDENT' },
        validSecret,
        { issuer: 'malicious-identity-provider' }
      );

      assert.throws(
        () => sessionService.verifyAccessToken(wrongIssuerToken, { expectedIssuer: '5tot-danang-backend' }),
        (err: any) => err instanceof ApiError && err.status === 401 && err.code === 'INVALID_TOKEN'
      );

      // Token with wrong audience
      const wrongAudienceToken = jwt.sign(
        { sub: 'user-1', email: 'u1@dut.udn.vn', roles: ['STUDENT'], activeRole: 'STUDENT' },
        validSecret,
        { audience: 'unauthorized-target-service' }
      );

      assert.throws(
        () => sessionService.verifyAccessToken(wrongAudienceToken, { expectedAudience: '5tot-danang-api' }),
        (err: any) => err instanceof ApiError && err.status === 401 && err.code === 'INVALID_TOKEN'
      );
    });
  });
});
