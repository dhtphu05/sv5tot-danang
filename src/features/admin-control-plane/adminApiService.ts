/**
 * 5TOT ĐHĐN — Admin Control Plane Backend V2 Sync Helper
 * Bridges `useAdminControlPlane` with Backend V2 (`/api/v2/admin/*`, `/api/v2/seasons/*`,
 * `/api/v2/institutions/*`, `/api/v2/school-review-units/*`) when running in Real Backend Mode.
 */

import { apiRequest, getApiActorContext } from '../../shared/api/httpClient';
import { isBackendMode } from '../../shared/config/executionMode';
import type {
  AdminControlPlaneSnapshot,
  CollectiveCriterionConfigItem,
  CriteriaVersion,
  Institution,
  NotificationTemplateConfig,
  SchoolReviewUnitConfig,
  Season,
  SeasonReadinessReport,
  StaffAccount,
  StaffAccountStatus,
  SystemIntegrationHealthItem,
  WorkflowOperationalPolicy,
} from '../../staff/adminTypes';
import type { StaffRole } from '../../staff/types';
import {
  INITIAL_INSTITUTIONS,
  INITIAL_NOTIFICATION_TEMPLATES,
  INITIAL_SEASONS,
  INITIAL_STAFF_ACCOUNTS,
  INITIAL_WORKFLOW_POLICY,
} from '../../staff/fixtures/adminDataset';

export function isRealBackendActive(): boolean {
  try {
    return isBackendMode();
  } catch {
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBackendSnapshotToFrontend(raw: any): Partial<AdminControlPlaneSnapshot> {
  if (!raw || typeof raw !== 'object') return {};

  const portalCounts = raw.portalCounts || {
    individualCount: 0,
    collectiveCount: 0,
    whiteBirdCount: 0,
    byInstitutionId: {} as Record<string, number>,
  };

  // 1. Institutions merged with live application counts and custom server institutions
  const baseInstMap = new Map<string, Institution>(
    INITIAL_INSTITUTIONS.map((inst) => [
      inst.id,
      {
        ...inst,
        applicationCount: portalCounts.byInstitutionId?.[inst.id] ?? 0,
      },
    ])
  );
  if (Array.isArray(raw.institutions)) {
    for (const srvInst of raw.institutions) {
      if (!srvInst?.id) continue;
      const existing = baseInstMap.get(srvInst.id);
      if (existing) {
        baseInstMap.set(srvInst.id, {
          ...existing,
          officialName: srvInst.officialName || existing.officialName,
          shortName: srvInst.shortName || existing.shortName,
          status: srvInst.isActive === false ? 'suspended' : 'active',
          applicationCount: portalCounts.byInstitutionId?.[srvInst.id] ?? existing.applicationCount,
        });
      } else {
        baseInstMap.set(srvInst.id, {
          id: srvInst.id,
          code: srvInst.code,
          officialName: srvInst.officialName,
          shortName: srvInst.shortName || srvInst.code || 'ĐV',
          institutionType:
            srvInst.group === 'COLLEGE_JUNIOR_COLLEGE' ? 'college' : 'university',
          organizationContext:
            srvInst.organizationContext || 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
          isUnderUdn: srvInst.group === 'UD_MEMBER_UNIVERSITY',
          schoolReviewUnitId:
            srvInst.group === 'UD_MEMBER_UNIVERSITY' ? 'unit-udn' : `unit-${srvInst.id}`,
          schoolReviewUnitName: srvInst.officialName,
          eligibilityMode: 'DIRECT_CITY',
          status: srvInst.isActive === false ? 'suspended' : 'active',
          participatingInActiveSeason: srvInst.isActive !== false,
          applicationCount: portalCounts.byInstitutionId?.[srvInst.id] ?? 0,
          contactEmail: srvInst.contactEmail,
          contactPhone: srvInst.contactPhone,
          searchKeywords: srvInst.searchKeywords || [srvInst.shortName || srvInst.officialName],
          createdAt: srvInst.createdAt
            ? new Date(srvInst.createdAt).toLocaleDateString('vi-VN')
            : 'Hôm nay',
          updatedAt: srvInst.updatedAt
            ? new Date(srvInst.updatedAt).toLocaleDateString('vi-VN')
            : 'Hôm nay',
        });
      }
    }
  }

  // 2. Staff Accounts merged with DB staff accounts
  const baseStaffByEmail = new Map<string, StaffAccount>(
    INITIAL_STAFF_ACCOUNTS.map((acc) => [
      acc.email.toLowerCase(),
      { ...acc, assignedApplicationCount: 0 },
    ])
  );
  if (Array.isArray(raw.staffAccounts)) {
    for (const srvStaff of raw.staffAccounts) {
      if (!srvStaff?.email) continue;
      const emailKey = String(srvStaff.email).toLowerCase();
      const existing = baseStaffByEmail.get(emailKey);
      const mappedStatus: StaffAccountStatus =
        srvStaff.inviteStatus === 'PENDING'
          ? 'pending_activation'
          : srvStaff.status === 'SUSPENDED'
          ? 'suspended'
          : srvStaff.status === 'LOCKED'
          ? 'retired'
          : 'active';
      const mappedRole = (srvStaff.roleCode || existing?.primaryRole || 'CITY_OFFICER') as StaffRole;
      baseStaffByEmail.set(emailKey, {
        id: srvStaff.id || existing?.id || `staff-${Date.now()}`,
        fullName: srvStaff.fullName || existing?.fullName || emailKey,
        email: srvStaff.email,
        phone: srvStaff.phone || existing?.phone,
        primaryRole: mappedRole,
        roleLabel: srvStaff.roleLabelVi || existing?.roleLabel || mappedRole,
        unitLabel:
          srvStaff.schoolReviewUnitLabelVi ||
          existing?.unitLabel ||
          'Ban Thư ký Hội Sinh viên Đại học Đà Nẵng',
        institutionId: srvStaff.institutionId || existing?.institutionId,
        schoolReviewUnitId:
          srvStaff.schoolReviewUnitId || existing?.schoolReviewUnitId || undefined,
        roles: [mappedRole],
        status: mappedStatus,
        assignedApplicationCount: 0,
        lastActiveAt: srvStaff.lastLoginAt
          ? new Date(srvStaff.lastLoginAt).toLocaleString('vi-VN')
          : existing?.lastActiveAt || 'Chưa đăng nhập',
        createdAt: srvStaff.createdAt
          ? new Date(srvStaff.createdAt).toLocaleDateString('vi-VN')
          : existing?.createdAt || 'Hôm nay',
        invitationCode: srvStaff.inviteCode || undefined,
      });
    }
  }

  // 3. Seasons with live application counts
  const mappedSeasons: Season[] = INITIAL_SEASONS.map((s) =>
    s.isCurrentActive
      ? {
          ...s,
          applicationCount: portalCounts.individualCount ?? 0,
          collectiveApplicationCount: portalCounts.collectiveCount ?? 0,
        }
      : s
  );

  // 4. Notification Templates mapped from Backend DTOs to Frontend NotificationTemplateConfig
  const mappedTemplates: NotificationTemplateConfig[] = Array.isArray(
    raw.notificationTemplates
  )
    ? raw.notificationTemplates.map((srvTpl: any) => {
        const fallback =
          INITIAL_NOTIFICATION_TEMPLATES.find(
            (t) => t.id === srvTpl.id || t.code === srvTpl.code
          ) || INITIAL_NOTIFICATION_TEMPLATES[0];
        return {
          ...fallback,
          id: srvTpl.id || fallback.id,
          code: srvTpl.code || fallback.code,
          titleVi: srvTpl.nameVi || srvTpl.titleVi || fallback.titleVi,
          subjectTemplate:
            srvTpl.subjectTemplateVi ||
            srvTpl.subjectTemplate ||
            fallback.subjectTemplate,
          bodyTemplate:
            srvTpl.bodyTemplateVi ||
            srvTpl.bodyTemplate ||
            fallback.bodyTemplate ||
            fallback.bodyTemplateVi,
          bodyTemplateVi:
            srvTpl.bodyTemplateVi ||
            srvTpl.bodyTemplate ||
            fallback.bodyTemplateVi,
          supportedVariables:
            srvTpl.supportedVariables || fallback.supportedVariables,
          allowedVariables:
            srvTpl.supportedVariables || fallback.allowedVariables,
          enabled: srvTpl.enabled ?? fallback.enabled,
          updatedAt: srvTpl.updatedAt
            ? new Date(srvTpl.updatedAt).toLocaleString('vi-VN')
            : fallback.updatedAt,
        };
      })
    : INITIAL_NOTIFICATION_TEMPLATES;

  // 5. Workflow Policy mapped from Backend DTO
  const mappedPolicy: WorkflowOperationalPolicy = raw.workflowPolicy
    ? {
        ...INITIAL_WORKFLOW_POLICY,
        defaultSupplementWindowHours:
          raw.workflowPolicy.defaultSupplementWindowHours ??
          INITIAL_WORKFLOW_POLICY.defaultSupplementWindowHours,
        requireCommonPdfForSchoolForwarding:
          raw.workflowPolicy.requirePdfForSchoolForwarding ?? true,
        updatedAt: raw.workflowPolicy.updatedAt
          ? new Date(raw.workflowPolicy.updatedAt).toLocaleString('vi-VN')
          : INITIAL_WORKFLOW_POLICY.updatedAt,
      }
    : INITIAL_WORKFLOW_POLICY;

  // 6. System Health mapped from Backend SystemHealthDiagnosticItemDto
  const mappedHealth: SystemIntegrationHealthItem[] | undefined = Array.isArray(
    raw.systemHealth
  )
    ? raw.systemHealth.map((item: any) => ({
        id: item.component || item.key || item.id,
        key: item.component || item.key || item.id,
        labelVi: item.nameVi || item.labelVi,
        nameVi: item.nameVi || item.labelVi,
        status:
          item.status === 'HEALTHY' || item.status === 'healthy'
            ? 'healthy'
            : 'warning',
        modeLabelVi: item.modeLabelVi,
        detailVi: item.detailVi,
        checkedAt: item.checkedAt,
      }))
    : undefined;

  return {
    institutions: Array.from(baseInstMap.values()),
    staffAccounts: Array.from(baseStaffByEmail.values()),
    seasons: mappedSeasons,
    notificationTemplates: mappedTemplates,
    workflowPolicy: mappedPolicy,
    ...(mappedHealth ? { systemHealth: mappedHealth } : {}),
  };
}

export async function fetchAdminSnapshotFromServer(): Promise<Partial<AdminControlPlaneSnapshot> | null> {
  if (!isRealBackendActive()) return null;
  const actor = getApiActorContext();
  if (!actor?.token || actor.role !== 'ADMIN') return null;
  try {
    const res = await apiRequest<{ success: boolean; data: unknown }>(
      '/api/v2/admin/control-plane'
    );
    if (!res?.data) return null;
    return mapBackendSnapshotToFrontend(res.data);
  } catch {
    return null;
  }
}

export async function syncAdminActionToServer<T = unknown>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown
): Promise<T | null> {
  if (!isRealBackendActive()) return null;
  try {
    const normalizedPath = path.startsWith('/api/v2/')
      ? path
      : path.replace(/^\/api\/admin/, '/api/v2/admin');
    return await apiRequest<T>(normalizedPath, { method, body });
  } catch {
    return null;
  }
}

export type {
  AdminControlPlaneSnapshot,
  CollectiveCriterionConfigItem,
  CriteriaVersion,
  Institution,
  NotificationTemplateConfig,
  SchoolReviewUnitConfig,
  Season,
  SeasonReadinessReport,
  StaffAccount,
  SystemIntegrationHealthItem,
  WorkflowOperationalPolicy,
};
