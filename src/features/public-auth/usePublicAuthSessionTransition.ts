/**
 * 5TOT Đà Nẵng — Public Auth & Persona Session Transition Hook (FSD Features Layer)
 * Handles login persona routing (Collective, School Officer, City Officer, City Manager, Committee, Student)
 * and new student registration state initialization.
 */

import React, { useCallback } from 'react';
import {
  SafeInternalReturnTarget,
  StudentRegistrationPayload,
} from '../../components/public/publicTypes';
import {
  ResolvedDeepLinkDestination,
  StudentNotificationItem,
} from '../../components/notifications/notificationTypes';
import { STAFF_DEMO_USERS } from '../../staff/fixtures/staffDataset';
import { INITIAL_STAFF_ACCOUNTS } from '../../staff/fixtures/admin/staffAccounts';
import { AUTHORIZED_COLLECTIVE_REGISTRY } from '../../staff/collectiveTypes';
import { SchoolReviewUnitId } from '../../staff/schoolReviewTypes';
import { StaffRole, StaffRouteId, StaffUser } from '../../staff/types';
import {
  PrototypeScenarioId,
  clonePristineStoreForScenario,
  savePersistedDemoSession,
} from '../../demo/prototypeDemoMode';
import { HomeDevScenarioId } from '../../demo/fixtures/homeScenarios';
import { ApplicationSubmissionState } from '../../components/submission/submissionTypes';
import { StudentApplicationData } from '../../demo/fixtures/studentApplication';
import { AuthSessionPayload } from '../../entities/services/contracts';

export interface UsePublicAuthSessionTransitionOptions {
  safeReturnTarget: SafeInternalReturnTarget | null;
  setSafeReturnTarget: React.Dispatch<
    React.SetStateAction<SafeInternalReturnTarget | null>
  >;
  setCollectiveUserEmail: React.Dispatch<React.SetStateAction<string>>;
  setViewMode: (
    mode:
      | 'public'
      | 'demo_launcher'
      | 'student_app'
      | 'staff_app'
      | 'collective_portal'
      | 'collective_login'
  ) => void;
  setIsSessionExpiredNotice: React.Dispatch<React.SetStateAction<boolean>>;
  setStaffUser: React.Dispatch<React.SetStateAction<StaffUser>>;
  setStaffRouteId: React.Dispatch<React.SetStateAction<StaffRouteId>>;
  setIsDemoActive: React.Dispatch<React.SetStateAction<boolean>>;
  setFocusCriterionId: React.Dispatch<React.SetStateAction<string | null>>;
  setPendingDeepLink: React.Dispatch<
    React.SetStateAction<ResolvedDeepLinkDestination | null>
  >;
  setActiveNavId: React.Dispatch<React.SetStateAction<string>>;
  setStudentIdentity: React.Dispatch<
    React.SetStateAction<{
      fullName: string;
      studentId: string;
      university: string;
    }>
  >;
  setPrototypeScenarioId: React.Dispatch<
    React.SetStateAction<PrototypeScenarioId>
  >;
  setHomeScenario: React.Dispatch<React.SetStateAction<HomeDevScenarioId>>;
  setAppSubmissionState: React.Dispatch<
    React.SetStateAction<ApplicationSubmissionState>
  >;
  setSharedApplication: React.Dispatch<
    React.SetStateAction<StudentApplicationData>
  >;
  setNotifications: React.Dispatch<
    React.SetStateAction<StudentNotificationItem[]>
  >;
  incrementScenarioResetKey: () => void;
  updateBrowserUrl: (path: string) => void;
}

export function usePublicAuthSessionTransition({
  safeReturnTarget,
  setSafeReturnTarget,
  setCollectiveUserEmail,
  setViewMode,
  setIsSessionExpiredNotice,
  setStaffUser,
  setStaffRouteId,
  setIsDemoActive,
  setFocusCriterionId,
  setPendingDeepLink,
  setActiveNavId,
  setStudentIdentity,
  setPrototypeScenarioId,
  setHomeScenario,
  setAppSubmissionState,
  setSharedApplication,
  setNotifications,
  incrementScenarioResetKey,
  updateBrowserUrl,
}: UsePublicAuthSessionTransitionOptions) {
  const handleLoginSuccess = useCallback(
    (email: string, session?: AuthSessionPayload) => {
      const lower = (email || '').trim().toLowerCase();
      const matchedStaffAccount = INITIAL_STAFF_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === lower
      );
      const matchedCollectiveAccount = AUTHORIZED_COLLECTIVE_REGISTRY.find(
        (col) => col.authorizedPreparerEmail.toLowerCase() === lower
      );
      const resolvedRole = (session?.user?.role ||
        matchedStaffAccount?.primaryRole) as StaffRole | undefined;

      if (
        session?.accountType === 'COLLECTIVE_PREPARER' ||
        Boolean(matchedCollectiveAccount) ||
        lower.includes('mai.nt') ||
        lower.includes('collective') ||
        lower.includes('chihoi') ||
        lower.includes('lch')
      ) {
        const resolvedCollectiveEmail =
          session?.user?.email ||
          matchedCollectiveAccount?.authorizedPreparerEmail ||
          'mai.nt@dut.udn.vn';
        setCollectiveUserEmail(resolvedCollectiveEmail);
        setViewMode('collective_portal');
        setIsSessionExpiredNotice(false);
        savePersistedDemoSession({
          viewMode: 'collective_portal',
          collectiveUserEmail: resolvedCollectiveEmail,
        });
        updateBrowserUrl('/collective');
        if (typeof window !== 'undefined')
          window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      const buildResolvedStaffUser = (role: StaffRole): StaffUser => {
        const base = STAFF_DEMO_USERS[role];
        return {
          ...base,
          id: session?.user?.id || matchedStaffAccount?.id || base.id,
          fullName:
            session?.user?.fullName ||
            matchedStaffAccount?.fullName ||
            base.fullName,
          email:
            session?.user?.email || matchedStaffAccount?.email || lower || base.email,
          primaryRole: role,
          roleLabel: matchedStaffAccount?.roleLabel || base.roleLabel,
          unitLabel:
            session?.user?.unitLabel ||
            matchedStaffAccount?.unitLabel ||
            base.unitLabel,
          schoolReviewUnitId:
            role === 'SCHOOL_OFFICER'
              ? ((session?.user?.unitId ||
                  matchedStaffAccount?.schoolReviewUnitId ||
                  base.schoolReviewUnitId) as SchoolReviewUnitId)
              : undefined,
          roles: [role],
        };
      };

      if (resolvedRole === 'SCHOOL_OFFICER' || lower.includes('an.nv')) {
        const nextStaffUser = buildResolvedStaffUser('SCHOOL_OFFICER');
        setStaffUser(nextStaffUser);
        setStaffRouteId('school_overview');
        setViewMode('staff_app');
        savePersistedDemoSession({
          viewMode: 'staff_app',
          staffRole: 'SCHOOL_OFFICER',
          staffRouteId: 'school_overview',
          staffUserOverride: nextStaffUser,
        });
        updateBrowserUrl('/staff/school/overview');
        if (typeof window !== 'undefined')
          window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      if (resolvedRole === 'CITY_OFFICER' || lower.includes('nam.th')) {
        const nextStaffUser = buildResolvedStaffUser('CITY_OFFICER');
        setStaffUser(nextStaffUser);
        setStaffRouteId('overview');
        setViewMode('staff_app');
        savePersistedDemoSession({
          viewMode: 'staff_app',
          staffRole: 'CITY_OFFICER',
          staffRouteId: 'overview',
          staffUserOverride: nextStaffUser,
        });
        updateBrowserUrl('/staff/overview');
        if (typeof window !== 'undefined')
          window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      if (resolvedRole === 'CITY_MANAGER' || lower.includes('ha.nt')) {
        const nextStaffUser = buildResolvedStaffUser('CITY_MANAGER');
        setStaffUser(nextStaffUser);
        setStaffRouteId('overview');
        setViewMode('staff_app');
        savePersistedDemoSession({
          viewMode: 'staff_app',
          staffRole: 'CITY_MANAGER',
          staffRouteId: 'overview',
          staffUserOverride: nextStaffUser,
        });
        updateBrowserUrl('/staff/overview');
        if (typeof window !== 'undefined')
          window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      if (resolvedRole === 'CITY_COMMITTEE' || lower.includes('quan.lm')) {
        const nextStaffUser = buildResolvedStaffUser('CITY_COMMITTEE');
        setStaffUser(nextStaffUser);
        setStaffRouteId('committee');
        setViewMode('staff_app');
        savePersistedDemoSession({
          viewMode: 'staff_app',
          staffRole: 'CITY_COMMITTEE',
          staffRouteId: 'committee',
          staffUserOverride: nextStaffUser,
        });
        updateBrowserUrl('/staff/committee');
        if (typeof window !== 'undefined')
          window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      if (
        resolvedRole === 'ADMIN' ||
        lower.includes('lan.pn') ||
        lower.includes('khoa.nd') ||
        lower.includes('admin')
      ) {
        const nextStaffUser = buildResolvedStaffUser('ADMIN');
        setStaffUser(nextStaffUser);
        setStaffRouteId('overview');
        setViewMode('staff_app');
        savePersistedDemoSession({
          viewMode: 'staff_app',
          staffRole: 'ADMIN',
          staffRouteId: 'overview',
          staffUserOverride: nextStaffUser,
        });
        updateBrowserUrl('/staff/overview');
        if (typeof window !== 'undefined')
          window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      if (session?.accountType === 'STUDENT' && session.user) {
        const nextFullName = session.user.fullName;
        const nextStudentId = session.user.studentCode || '';
        const nextUniversity = session.user.institutionName || '';
        const nextEmail = session.user.email || lower;
        setStudentIdentity((prev) => ({
          fullName: nextFullName || prev.fullName,
          studentId: nextStudentId || prev.studentId,
          university: nextUniversity || prev.university,
        }));
        setSharedApplication((prev) => {
          const updated: StudentApplicationData = {
            ...prev,
            student: {
              ...prev.student,
              fullName: nextFullName || prev.student.fullName,
              studentId: nextStudentId || prev.student.studentId,
              university: nextUniversity || prev.student.university,
              email: nextEmail || prev.student.email,
            },
          };
          savePersistedDemoSession({
            mutatedApplication: updated,
          });
          return updated;
        });
      }

      setViewMode('student_app');
      setIsSessionExpiredNotice(false);

      if (safeReturnTarget) {
        const target = safeReturnTarget;
        setSafeReturnTarget(null);
        if (target.criterionId) {
          setFocusCriterionId(target.criterionId);
          setPendingDeepLink({
            navId: 'application',
            enterSupplementMode: target.criterionId === 'volunteer',
            focusCriterionId: target.criterionId,
            focusRequirementId:
              target.criterionId === 'volunteer'
                ? 'volunteer-activities'
                : undefined,
          });
        }
        setActiveNavId(target.navId);
        savePersistedDemoSession({
          viewMode: 'student_app',
          navId: target.navId,
        });
      } else {
        setActiveNavId('overview');
        savePersistedDemoSession({
          viewMode: 'student_app',
          navId: 'overview',
        });
      }

      updateBrowserUrl('/app');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    },
    [
      safeReturnTarget,
      setSafeReturnTarget,
      setCollectiveUserEmail,
      setViewMode,
      setIsSessionExpiredNotice,
      setStaffUser,
      setStaffRouteId,
      setIsDemoActive,
      setFocusCriterionId,
      setPendingDeepLink,
      setActiveNavId,
      setStudentIdentity,
      setSharedApplication,
      updateBrowserUrl,
    ]
  );

  const handleSignupSuccess = useCallback(
    (payload: StudentRegistrationPayload) => {
      const newIdentity = {
        fullName: payload.fullName,
        studentId: payload.studentId,
        university: payload.institutionName,
      };
      setStudentIdentity(newIdentity);

      const nextStore = clonePristineStoreForScenario('new_student');
      setPrototypeScenarioId('new_student');
      setHomeScenario('state_a_no_app');
      setAppSubmissionState(nextStore.submissionState);
      setSharedApplication({
        ...nextStore.application,
        student: {
          ...nextStore.application.student,
          ...newIdentity,
        },
      });
      setNotifications(nextStore.notifications);
      setViewMode('student_app');
      setActiveNavId('overview');
      incrementScenarioResetKey();

      savePersistedDemoSession({
        scenarioId: 'new_student',
        viewMode: 'student_app',
        navId: 'overview',
        mutatedApplication: null,
        mutatedNotifications: null,
      });
      updateBrowserUrl('/app');

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    },
    [
      setStudentIdentity,
      setPrototypeScenarioId,
      setHomeScenario,
      setAppSubmissionState,
      setSharedApplication,
      setNotifications,
      setViewMode,
      setActiveNavId,
      incrementScenarioResetKey,
      updateBrowserUrl,
    ]
  );

  return {
    handleLoginSuccess,
    handleSignupSuccess,
  };
}
