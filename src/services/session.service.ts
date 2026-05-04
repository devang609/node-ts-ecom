import { Op } from 'sequelize';

import { UserSession } from '../models/index.js';

export async function createSession(params: { userId: string; refreshTokenHash: string }): Promise<UserSession> {
  return UserSession.create({
    userId: params.userId,
    refreshTokenHash: params.refreshTokenHash,
    revokedAt: null
  });
}

export async function getSessionByRefreshTokenHash(refreshTokenHash: string): Promise<UserSession | null> {
  return UserSession.findOne({
    where: {
      refreshTokenHash,
      revokedAt: null
    }
  });
}

export async function rotateSession(sessionId: string, newRefreshTokenHash: string): Promise<void> {
  await UserSession.update({ refreshTokenHash: newRefreshTokenHash }, { where: { id: sessionId } });
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await UserSession.update(
    { revokedAt: new Date() },
    {
      where: {
        userId,
        revokedAt: { [Op.is]: null }
      }
    }
  );
}

