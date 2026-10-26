/**
 * 5TOT Đà Nẵng — Test Fake Session Repository
 * STRICTLY FOR UNIT & CONTRACT TESTING. NEVER USED IN PRODUCTION.
 */

import { ISessionRepository } from '../../src/modules/sessions/session.repository';
import {
  AuthSessionEntity,
  CreateSessionDto,
  SessionRevocationReason,
} from '../../src/modules/sessions/session.types';

export class FakeSessionRepository implements ISessionRepository {
  public sessions: Map<string, AuthSessionEntity> = new Map();

  public async createSession(dto: CreateSessionDto): Promise<AuthSessionEntity> {
    const id = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const session: AuthSessionEntity = {
      id,
      userId: dto.userId,
      tokenFamilyId: dto.tokenFamilyId,
      refreshTokenHash: dto.refreshTokenHash,
      userAgent: dto.userAgent || null,
      ipAddress: dto.ipAddress || null,
      expiresAt: dto.expiresAt,
      lastUsedAt: new Date(),
      revokedAt: null,
      revokeReason: null,
      createdAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  public async findById(sessionId: string): Promise<AuthSessionEntity | null> {
    return this.sessions.get(sessionId) || null;
  }

  public async findByRefreshTokenHash(hash: string): Promise<AuthSessionEntity | null> {
    for (const s of this.sessions.values()) {
      if (s.refreshTokenHash === hash) {
        return s;
      }
    }
    return null;
  }

  public async rotateSession(
    oldSessionId: string,
    newSession: CreateSessionDto
  ): Promise<AuthSessionEntity> {
    const old = this.sessions.get(oldSessionId);
    if (!old || old.revokedAt !== null) {
      throw new Error('CONCURRENCY_CONFLICT: Phiên làm việc đã bị thu hồi hoặc đã được xoay vòng bởi yêu cầu đồng thời khác.');
    }

    old.revokedAt = new Date();
    old.revokeReason = 'ROTATED';
    old.lastUsedAt = new Date();

    return this.createSession(newSession);
  }

  public async listActiveSessions(userId: string): Promise<AuthSessionEntity[]> {
    const list: AuthSessionEntity[] = [];
    const now = new Date();
    for (const session of this.sessions.values()) {
      if (session.userId === userId && session.revokedAt === null && session.expiresAt > now) {
        list.push(session);
      }
    }
    return list.sort((a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime());
  }

  public async revokeSession(sessionId: string, reason: SessionRevocationReason): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session && !session.revokedAt) {
      session.revokedAt = new Date();
      session.revokeReason = reason;
    }
  }

  public async revokeTokenFamily(tokenFamilyId: string, reason: SessionRevocationReason): Promise<number> {
    let count = 0;
    for (const session of this.sessions.values()) {
      if (session.tokenFamilyId === tokenFamilyId && !session.revokedAt) {
        session.revokedAt = new Date();
        session.revokeReason = reason;
        count++;
      }
    }
    return count;
  }

  public async revokeAllUserSessions(userId: string, reason: SessionRevocationReason): Promise<number> {
    let count = 0;
    for (const session of this.sessions.values()) {
      if (session.userId === userId && !session.revokedAt) {
        session.revokedAt = new Date();
        session.revokeReason = reason;
        count++;
      }
    }
    return count;
  }

  public async revokeOtherSessions(userId: string, keepSessionId: string, reason: SessionRevocationReason): Promise<number> {
    let count = 0;
    for (const session of this.sessions.values()) {
      if (session.userId === userId && session.id !== keepSessionId && !session.revokedAt) {
        session.revokedAt = new Date();
        session.revokeReason = reason;
        count++;
      }
    }
    return count;
  }

  public async cleanupExpiredSessions(): Promise<number> {
    let count = 0;
    const now = new Date();
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt < now && session.revokedAt !== null) {
        this.sessions.delete(id);
        count++;
      }
    }
    return count;
  }
}
