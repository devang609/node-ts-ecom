import { AppError } from './errors';
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';

const app: Application = express();

app.use(helmet());

app.use(cors({
  origin: ENV.IS_PRODUCTION
    ? ['https://your-frontend-domain.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

const globalRateLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.WINDOW_MS,
  max: ENV.RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use(globalRateLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(ENV.COOKIE_SECRET));

app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`[${req.method}] ${req.originalUrl} — IP: ${req.ip}`);
  next();
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', environment: ENV.NODE_ENV });
});

app.use('/auth', authRoutes);
// app.use('/product', productRoutes);
// app.use('/cart', cartRoutes);
// app.use('/buy', buyRoutes);
// app.use('/users', userRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(`[${err.statusCode}] ${err.message}`);
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    success: false,
    message: ENV.IS_PRODUCTION ? 'Internal server error.' : err.message,
  });
});


export default app;