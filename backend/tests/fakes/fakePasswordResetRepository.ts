/**
 * 5TOT Đà Nẵng — Test Fake Password Reset Repository
 * STRICTLY FOR UNIT & CONTRACT TESTING. NEVER USED IN PRODUCTION.
 */

import { IPasswordResetRepository } from '../../src/modules/accountSecurity/passwordReset.repository';
import { PasswordResetTokenEntity } from '../../src/modules/accountSecurity/passwordReset.types';

export class FakePasswordResetRepository implements IPasswordResetRepository {
  public tokens: Map<string, PasswordResetTokenEntity> = new Map();

  public async createResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<PasswordResetTokenEntity> {
    const id = `reset-token-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const record: PasswordResetTokenEntity = {
      id,
      userId,
      tokenHash,
      expiresAt,
      usedAt: null,
      createdAt: new Date(),
    };
    this.tokens.set(tokenHash, record);
    return record;
  }

  public async findByTokenHash(tokenHash: string): Promise<PasswordResetTokenEntity | null> {
    return this.tokens.get(tokenHash) || null;
  }

  public async markAsUsed(id: string): Promise<void> {
    for (const record of this.tokens.values()) {
      if (record.id === id) {
        record.usedAt = new Date();
        break;
      }
    }
  }

  public async invalidateUserTokens(userId: string): Promise<void> {
    for (const record of this.tokens.values()) {
      if (record.userId === userId && record.usedAt === null) {
        record.usedAt = new Date();
      }
    }
  }
}
