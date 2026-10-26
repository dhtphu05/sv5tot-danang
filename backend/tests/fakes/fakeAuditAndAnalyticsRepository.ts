/**
 * 5TOT Đà Nẵng — Fake Audit & Analytics Repository (Test-Only Fake)
 */

import type {
  IAuditAndAnalyticsRepository,
  AuditLogFilter,
} from '../../src/modules/auditAndAnalytics/auditAndAnalytics.repository';
import type {
  AuditLogEventDto,
  NotificationDto,
  OperationalAnalyticsDto,
} from '../../src/modules/auditAndAnalytics/auditAndAnalytics.types';
import type { PaginatedResult } from '../../src/shared/query/pagination';

export class FakeAuditAndAnalyticsRepository implements IAuditAndAnalyticsRepository {
  public auditEvents: AuditLogEventDto[] = [];
  public notifications = new Map<string, NotificationDto>();

  public async queryAuditLogs(filter: AuditLogFilter): Promise<PaginatedResult<AuditLogEventDto>> {
    let list = [...this.auditEvents];
    if (filter.applicationId) {
      list = list.filter((e) => e.applicationId === filter.applicationId);
    }
    if (filter.actionCode) {
      list = list.filter((e) => e.actionCode === filter.actionCode);
    }

    return {
      data: list,
      pagination: {
        limit: 50,
        hasMore: false,
        totalCount: list.length,
      },
    };
  }

  public async listNotifications(userId: string, status?: 'UNREAD' | 'READ'): Promise<NotificationDto[]> {
    return Array.from(this.notifications.values()).filter(
      (n) => n.recipientUserId === userId && (!status || n.status === status)
    );
  }

  public async countUnreadNotifications(userId: string): Promise<number> {
    return Array.from(this.notifications.values()).filter(
      (n) => n.recipientUserId === userId && n.status === 'UNREAD'
    ).length;
  }

  public async markNotificationAsRead(id: string, userId: string): Promise<void> {
    const notif = this.notifications.get(id);
    if (notif && notif.recipientUserId === userId) {
      this.notifications.set(id, { ...notif, status: 'READ', readAt: new Date() });
    }
  }

  public async markAllNotificationsAsRead(userId: string): Promise<void> {
    for (const [id, notif] of this.notifications.entries()) {
      if (notif.recipientUserId === userId) {
        this.notifications.set(id, { ...notif, status: 'READ', readAt: new Date() });
      }
    }
  }

  public async getOperationalAnalytics(seasonId: string): Promise<OperationalAnalyticsDto> {
    return {
      seasonId,
      totalIndividualApplications: 120,
      totalCollectiveApplications: 15,
      stageBreakdown: {
        studentDraft: 20,
        schoolPreliminary: 45,
        cityReview: 35,
        committeeFinalization: 15,
        completed: 5,
      },
      outcomesBreakdown: {
        recognizedIndividual: 10,
        notRecognizedIndividual: 2,
        recognizedCollective: 3,
        notRecognizedCollective: 0,
      },
      institutionBreakdown: [
        {
          institutionId: 'inst-dut',
          institutionCode: 'DUT',
          institutionName: 'Đại học Bách Khoa',
          individualCount: 50,
          collectiveCount: 8,
        },
      ],
    };
  }
}
