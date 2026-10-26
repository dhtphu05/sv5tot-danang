/**
 * 5TOT Đà Nẵng — Strict CORS Allowlist Middleware
 * Validates origin against configured allowlist; denies wildcards in production.
 */

import type { Request, Response, NextFunction } from 'express';
import { getEnvironment } from '../../config/environment';
import { ApiError } from '../errors/apiError';

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  const env = getEnvironment();

  // If no origin header (same-origin, curl, server-to-server), proceed
  if (!origin) {
    return next();
  }

  const isAllowed = env.CORS_ALLOWED_ORIGINS.includes(origin);

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Request-ID, Idempotency-Key'
    );
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  // Handle pre-flight request
  if (req.method === 'OPTIONS') {
    if (!isAllowed) {
      return next(ApiError.forbidden(`Origin "${origin}" is not authorized by CORS policy.`));
    }
    res.status(204).end();
    return;
  }

  if (!isAllowed) {
    return next(ApiError.forbidden(`Origin "${origin}" is not authorized by CORS policy.`));
  }

  next();
}
