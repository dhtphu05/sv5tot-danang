/**
 * 5TOT Đà Nẵng — Authorization & RBAC/ABAC Domain Unit Tests (BE2-A)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { RolePolicy } from '../../src/modules/authorization/role.policy';
import { ScopePolicy } from '../../src/modules/authorization/scope.policy';
import { AuthorizationService } from '../../src/modules/authorization/authorization.service';
import { FakeIdentityRepository } from '../fakes/fakeIdentityRepository';
import { AuthenticatedActor } from '../../src/modules/authorization/authorization.types';
import { ApiError } from '../../src/shared/errors/apiError';

describe('Backend V2: Role-Based & Attribute-Based Authorization Unit Tests', () => {
  let fakeRepo: FakeIdentityRepository;
  let authzService: AuthorizationService;

  beforeEach(() => {
    fakeRepo = new FakeIdentityRepository();
    authzService = new AuthorizationService(fakeRepo);
  });

  describe('RolePolicy Capabilities', () => {
    it('verifies student permitted and forbidden actions', () => {
      assert.equal(RolePolicy.canRolePerform('STUDENT', 'STUDENT_CREATE_APPLICATION'), true);
      assert.equal(RolePolicy.canRolePerform('STUDENT', 'STUDENT_EDIT_DECLARATIONS'), true);
      assert.equal(RolePolicy.canRolePerform('STUDENT', 'STUDENT_SUBMIT_APPLICATION'), true);
      assert.equal(RolePolicy.canRolePerform('STUDENT', 'SCHOOL_REVIEW_PRELIMINARY'), false);
      assert.equal(RolePolicy.canRolePerform('STUDENT', 'CITY_REVIEW_CRITERIA'), false);
      assert.equal(RolePolicy.canRolePerform('STUDENT', 'ADMIN_MANAGE_STAFF'), false);
    });

    it('verifies school officer capabilities', () => {
      assert.equal(RolePolicy.canRolePerform('SCHOOL_OFFICER', 'SCHOOL_REVIEW_PRELIMINARY'), true);
      assert.equal(RolePolicy.canRolePerform('SCHOOL_OFFICER', 'SCHOOL_FORWARD_TO_CITY'), true);
      assert.equal(RolePolicy.canRolePerform('SCHOOL_OFFICER', 'CITY_INTAKE_ASSIGN'), false);
      assert.equal(RolePolicy.canRolePerform('SCHOOL_OFFICER', 'COMMITTEE_RECORD_DECISION'), false);
    });

    it('verifies city manager vs city officer capabilities (strict role separation)', () => {
      assert.equal(RolePolicy.canRolePerform('CITY_OFFICER', 'CITY_REVIEW_CRITERIA'), true);
      assert.equal(RolePolicy.canRolePerform('CITY_OFFICER', 'REVIEW_ASSIGNED_APPLICATION'), true);
      assert.equal(RolePolicy.canRolePerform('CITY_OFFICER', 'CITY_INTAKE_ASSIGN'), false);
      assert.equal(RolePolicy.canRolePerform('CITY_OFFICER', 'ASSIGN_CITY_OFFICER'), false);

      // City Manager has intake/assignment authority, NOT criteria review judgments
      assert.equal(RolePolicy.canRolePerform('CITY_MANAGER', 'CITY_INTAKE_ASSIGN'), true);
      assert.equal(RolePolicy.canRolePerform('CITY_MANAGER', 'ASSIGN_CITY_OFFICER'), true);
      assert.equal(RolePolicy.canRolePerform('CITY_MANAGER', 'CITY_REVIEW_CRITERIA'), false);
      assert.equal(RolePolicy.canRolePerform('CITY_MANAGER', 'REVIEW_ASSIGNED_APPLICATION'), false);
      assert.equal(RolePolicy.canRolePerform('CITY_MANAGER', 'CITY_COMPLETE_REVIEW'), false);
    });

    it('verifies committee capabilities (strict separation from admin)', () => {
      assert.equal(RolePolicy.canRolePerform('CITY_COMMITTEE', 'COMMITTEE_RECORD_DECISION'), true);
      assert.equal(RolePolicy.canRolePerform('CITY_COMMITTEE', 'RECORD_COMMITTEE_DECISION'), true);
      assert.equal(RolePolicy.canRolePerform('CITY_COMMITTEE', 'DELIBERATE_IN_COMMITTEE'), true);
      assert.equal(RolePolicy.canRolePerform('CITY_COMMITTEE', 'FINALIZE_OFFICIAL_RESULTS'), true);
      assert.equal(RolePolicy.canRolePerform('CITY_COMMITTEE', 'COMMITTEE_PUBLISH_RESULTS'), true);
      assert.equal(RolePolicy.canRolePerform('CITY_COMMITTEE', 'ADMIN_MANAGE_STAFF'), false);

      // Admin CANNOT deliberate in committee or record official recognition decisions
      assert.equal(RolePolicy.canRolePerform('ADMIN', 'DELIBERATE_IN_COMMITTEE'), false);
      assert.equal(RolePolicy.canRolePerform('ADMIN', 'RECORD_COMMITTEE_DECISION'), false);
      assert.equal(RolePolicy.canRolePerform('ADMIN', 'COMMITTEE_RECORD_DECISION'), false);
      assert.equal(RolePolicy.canRolePerform('ADMIN', 'FINALIZE_OFFICIAL_RESULTS'), false);
      assert.equal(RolePolicy.canRolePerform('ADMIN', 'REVIEW_ASSIGNED_APPLICATION'), false);
    });

    it('verifies admin capabilities', () => {
      assert.equal(RolePolicy.canRolePerform('ADMIN', 'ADMIN_MANAGE_STAFF'), true);
      assert.equal(RolePolicy.canRolePerform('ADMIN', 'ADMIN_MANAGE_SEASONS'), true);
      assert.equal(RolePolicy.canRolePerform('ADMIN', 'ADMIN_VIEW_AUDIT_LOGS'), true);
    });
  });

  describe('ScopePolicy Multi-Tenant & Resource Boundaries', () => {
    it('enforces student applicant self-ownership: Student A cannot access Student B', () => {
      const studentActor: AuthenticatedActor = {
        userId: 'student-id-001',
        email: 'student1@dut.udn.vn',
        fullName: 'Student 1',
        roles: ['STUDENT'],
        activeRole: 'STUDENT',
        institutionId: 'dut',
        schoolReviewUnitId: null,
        sessionId: 'sess-1',
      };

      // Allowed for own application
      const canAccessOwn = ScopePolicy.canAccessStudentResource(studentActor, {
        applicantUserId: 'student-id-001',
      });
      assert.equal(canAccessOwn, true);

      // Forbidden for other student application
      const canAccessOther = ScopePolicy.canAccessStudentResource(studentActor, {
        applicantUserId: 'student-id-999',
      });
      assert.equal(canAccessOther, false);
    });

    it('enforces Authoritative UDN School Review Unit scoping: Single shared UDN Officer can access all UDN member applications (DUT, UED, etc.) but CANNOT access non-UDN institutions', () => {
      const udnSharedOfficer: AuthenticatedActor = {
        userId: 'user-officer-udn-shared',
        email: 'hsv@udn.vn',
        fullName: 'Cán bộ Ban Thư ký Hội Sinh viên ĐH Đà Nẵng',
        roles: ['SCHOOL_OFFICER'],
        activeRole: 'SCHOOL_OFFICER',
        institutionId: 'inst-udn',
        schoolReviewUnitId: 'unit-udn',
        sessionId: 'sess-udn-shared',
      };

      // 1. CAN access DUT student application (resolves to unit-udn)
      const canReviewDUT = ScopePolicy.canAccessStudentResource(udnSharedOfficer, {
        institutionId: 'inst-dut',
        schoolReviewUnitId: 'unit-udn',
      });
      assert.equal(canReviewDUT, true, 'UDN reviewer must have access to DUT application');

      // 2. CAN access UED student application (resolves to unit-udn)
      const canReviewUED = ScopePolicy.canAccessStudentResource(udnSharedOfficer, {
        institutionId: 'inst-ued',
        schoolReviewUnitId: 'unit-udn',
      });
      assert.equal(canReviewUED, true, 'UDN reviewer must have access to UED application');

      // 3. CAN access all other configured UDN member applications
      const otherUdnMembers = ['inst-due', 'inst-ufl', 'inst-ute', 'inst-vku', 'inst-smp', 'inst-vnuk'];
      for (const instId of otherUdnMembers) {
        const canReviewMember = ScopePolicy.canAccessStudentResource(udnSharedOfficer, {
          institutionId: instId,
          schoolReviewUnitId: 'unit-udn',
        });
        assert.equal(canReviewMember, true, `UDN reviewer must have access to ${instId}`);
      }

      // 4. CANNOT access non-UDN institutions (e.g. Duy Tân, Kiến trúc, FPT)
      const canReviewDTU = ScopePolicy.canAccessStudentResource(udnSharedOfficer, {
        institutionId: 'inst-dtu',
        schoolReviewUnitId: 'unit-dtu',
      });
      assert.equal(canReviewDTU, false, 'UDN reviewer must NOT have access to DTU application');

      // 5. Independent institution reviewer CANNOT access UDN applications
      const dtuOfficer: AuthenticatedActor = {
        userId: 'officer-dtu-01',
        email: 'officer@dtu.edu.vn',
        fullName: 'Cán bộ Duy Tân',
        roles: ['SCHOOL_OFFICER'],
        activeRole: 'SCHOOL_OFFICER',
        institutionId: 'inst-dtu',
        schoolReviewUnitId: 'unit-dtu',
        sessionId: 'sess-dtu',
      };
      const dtuReviewUdn = ScopePolicy.canAccessStudentResource(dtuOfficer, {
        institutionId: 'inst-dut',
        schoolReviewUnitId: 'unit-udn',
      });
      assert.equal(dtuReviewUdn, false, 'DTU reviewer must NOT have access to UDN application');
    });

    it('enforces shared City Officer review access without assignment requirement', () => {
      const cityOfficer: AuthenticatedActor = {
        userId: 'officer-city-01',
        email: 'city.officer@danang.gov.vn',
        fullName: 'Cán bộ Thành Đoàn',
        roles: ['CITY_OFFICER'],
        activeRole: 'CITY_OFFICER',
        institutionId: null,
        schoolReviewUnitId: null,
        sessionId: 'sess-city',
      };

      // City stage application without assignment or assigned to another officer
      const canReviewShared = ScopePolicy.canAccessStudentResource(cityOfficer, {
        workflowStage: 'CITY_INTAKE',
        assignedCityOfficerId: 'officer-city-99',
      });
      assert.equal(canReviewShared, true);

      // Pre-forwarded school preliminary application CANNOT be accessed by City Officer
      const canReviewUnforwardedSchool = ScopePolicy.canAccessStudentResource(cityOfficer, {
        workflowStage: 'SCHOOL_PRELIMINARY',
      });
      assert.equal(canReviewUnforwardedSchool, false);
    });

    it('enforces Collective Preparer authorization scoping', async () => {
      const preparerActor: AuthenticatedActor = {
        userId: 'preparer-01',
        email: 'preparer@dut.udn.vn',
        fullName: 'Bí thư Chi đoàn A',
        roles: ['STUDENT', 'COLLECTIVE_PREPARER'],
        activeRole: 'COLLECTIVE_PREPARER',
        institutionId: 'dut',
        schoolReviewUnitId: null,
        sessionId: 'sess-preparer',
      };

      // Grant access to Unit A only
      fakeRepo.grantCollectiveAccess('preparer-01', 'col-unit-A', 'season-2025-2026');

      const canAccessUnitA = await ScopePolicy.canAccessCollectiveUnit(
        preparerActor,
        'col-unit-A',
        'season-2025-2026',
        fakeRepo
      );
      assert.equal(canAccessUnitA, true);

      // Unauthorized for Unit B
      const canAccessUnitB = await ScopePolicy.canAccessCollectiveUnit(
        preparerActor,
        'col-unit-B',
        'season-2025-2026',
        fakeRepo
      );
      assert.equal(canAccessUnitB, false);
    });
  });

  describe('AuthorizationService Centralized Assertion', () => {
    it('throws 403 Forbidden with ApiError on unauthorized action', async () => {
      const studentActor: AuthenticatedActor = {
        userId: 'student-id-001',
        email: 'student1@dut.udn.vn',
        fullName: 'Student 1',
        roles: ['STUDENT'],
        activeRole: 'STUDENT',
        institutionId: 'dut',
        schoolReviewUnitId: null,
        sessionId: 'sess-1',
      };

      await assert.rejects(
        async () => {
          await authzService.assertCan(studentActor, 'SCHOOL_REVIEW_PRELIMINARY', {
            schoolReviewUnitId: 'unit-udn',
          });
        },
        (err: any) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.status, 403);
          assert.equal(err.code, 'FORBIDDEN_ACTION');
          return true;
        }
      );
    });
  });
});
