import cookieParser from 'cookie-parser';
import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { config } from './config/config.js';
import { buildOpenApiSpec } from './config/openapi.js';
import { errorConverter, errorHandler } from './middlewares/error.js';
import { requestLogger } from './middlewares/requestLogger.js';
import routes from './routes/index.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(requestLogger);
  app.use(routes);

  if (config.swaggerEnabled) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(buildOpenApiSpec()));
  }

  app.use(errorConverter);
  app.use(errorHandler);

  return app;
}

