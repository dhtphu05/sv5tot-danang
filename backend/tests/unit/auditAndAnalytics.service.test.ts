/**
 * 5TOT Đà Nẵng — Audit, Notifications & Analytics Service Unit Tests (Backend V2)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { FakeAuditAndAnalyticsRepository } from '../fakes/fakeAuditAndAnalyticsRepository';
import { AuditAndAnalyticsService } from '../../src/modules/auditAndAnalytics/auditAndAnalytics.service';
import type { AuthenticatedActor } from '../../src/modules/authorization/authorization.types';

describe('Backend V2: Audit & Analytics Domain Service Unit Tests', () => {
  let fakeRepo: FakeAuditAndAnalyticsRepository;
  let service: AuditAndAnalyticsService;

  const adminActor: AuthenticatedActor = {
    userId: 'user-admin-1',
    email: 'admin@danang.gov.vn',
    fullName: 'Quản trị viên Thành Đoàn',
    activeRole: 'ADMIN',
    roles: ['ADMIN'],
    institutionId: null,
    schoolReviewUnitId: null,
    sessionId: 'sess-admin-1',
  };

  const studentActor: AuthenticatedActor = {
    userId: 'user-student-1',
    email: 'student@dut.udn.vn',
    fullName: 'Nguyễn Văn A',
    activeRole: 'STUDENT',
    roles: ['STUDENT'],
    institutionId: 'inst-dut',
    schoolReviewUnitId: 'unit-udn',
    sessionId: 'sess-student-1',
  };

  beforeEach(() => {
    fakeRepo = new FakeAuditAndAnalyticsRepository();
    service = new AuditAndAnalyticsService(fakeRepo);
  });

  it('queries audit log events with filter parameters', async () => {
    fakeRepo.auditEvents.push({
      id: 'audit-001',
      occurredAt: new Date(),
      requestId: 'req-01',
      actorRole: 'STUDENT',
      entityType: 'INDIVIDUAL_APPLICATION',
      entityId: 'app-001',
      applicationId: 'app-001',
      actionCode: 'SUBMIT_APPLICATION',
    });

    const result = await service.queryAuditLogs(adminActor, { applicationId: 'app-001' });
    assert.equal(result.pagination.totalCount, 1);
    assert.equal(result.data[0].actionCode, 'SUBMIT_APPLICATION');
  });

  it('manages in-app notifications and unread badges', async () => {
    fakeRepo.notifications.set('notif-1', {
      id: 'notif-1',
      recipientUserId: studentActor.userId,
      channel: 'IN_APP',
      category: 'SUPPLEMENT_REQUESTED',
      title: 'Yêu cầu bổ sung minh chứng',
      body: 'Cán bộ trường yêu cầu bổ sung bảng điểm HK1',
      status: 'UNREAD',
      createdAt: new Date(),
    });

    const unreadBefore = await service.getUnreadCount(studentActor);
    assert.equal(unreadBefore, 1);

    await service.markNotificationAsRead(studentActor, 'notif-1');

    const unreadAfter = await service.getUnreadCount(studentActor);
    assert.equal(unreadAfter, 0);
  });

  it('aggregates operational analytics across stages and institutions', async () => {
    const analytics = await service.getOperationalAnalytics(adminActor, 'season-2025-2026');
    assert.equal(analytics.totalIndividualApplications, 120);
    assert.equal(analytics.totalCollectiveApplications, 15);
    assert.ok(analytics.institutionBreakdown.length > 0);
  });
});
