/**
 * 5TOT ĐHĐN — Production Backend V2 HTTP Listener
 */

import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

import { createApp } from './createApp';
import { getEnvironment } from '../config/environment';
import { registerGracefulShutdown } from './lifecycle';
import { logger } from '../shared/logging/logger';

const env = getEnvironment();
const app = createApp();

const server = app.listen(env.PORT, '0.0.0.0', () => {
  logger.info(`5TOT Đà Nẵng Backend V2 running on http://0.0.0.0:${env.PORT}`, {
    environment: env.NODE_ENV,
    apiPrefix: env.API_PREFIX,
    port: env.PORT,
  });
});

registerGracefulShutdown(server);
