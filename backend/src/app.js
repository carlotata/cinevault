import express from 'express';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { createApiRouter } from './routes/index.js';

export function createApp({ authLimit = 10, tmdbLimit = 60 } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', createApiRouter({ authLimit, tmdbLimit }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
