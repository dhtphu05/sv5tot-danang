/**
 * 5TOT ĐHĐN — Feedback & Bug Report Routes
 */

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { FeedbackController } from './feedback.controller';
import type { SessionService } from '../sessions/session.service';

export function createFeedbackRouter(
  controller: FeedbackController,
  sessionService?: SessionService
): Router {
  const router = Router();

  // Optional authentication: if Authorization header is provided, resolve actor without throwing on failure
  router.use(async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token) {
        try {
          const { portalState } = await import('../domainPortal/domainPortal.state');
          const portalSession = portalState.sessions.get(token);
          if (portalSession?.user) {
            req.actor = {
              userId: portalSession.user.id,
              email: portalSession.user.email,
              fullName: portalSession.user.fullName,
              roles: [portalSession.user.role as any],
              activeRole: portalSession.user.role as any,
              institutionId: portalSession.user.institutionId || null,
              schoolReviewUnitId: portalSession.user.unitId || null,
              sessionId: token,
            };
          } else if (sessionService) {
            const decoded = sessionService.verifyAccessToken(token);
            req.actor = {
              userId: decoded.sub,
              email: decoded.email,
              fullName: decoded.fullName,
              roles: decoded.roles as any,
              activeRole: decoded.activeRole as any,
              institutionId: decoded.institutionId || null,
              schoolReviewUnitId: decoded.schoolReviewUnitId || null,
              sessionId: decoded.sessionId || decoded.sid || '',
            };
          }
        } catch {
          // Token expired or invalid: proceed as unauthenticated guest
        }
      }
    }
    next();
  });

  router.post('/', controller.submitFeedback);

  return router;
}
