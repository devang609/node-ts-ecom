import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env';
import { logger } from './utils/logger';

const app: Application = express();

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());  // Sets secure HTTP headers

app.use(cors({
  origin: ENV.IS_PRODUCTION
    ? ['https://your-frontend-domain.com']   // Lock down in prod
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,   // Required for HttpOnly cookies to be sent cross-origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// Global rate limiter — tighter limits on auth routes are added there directly
const globalRateLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.WINDOW_MS,
  max: ENV.RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use(globalRateLimiter);

// ── Body & Cookie Parsing ─────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));   // Prevent large payload DoS attacks
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(ENV.COOKIE_SECRET));

// ── Request Logging ───────────────────────────────────────────────────────────
// Log method + URL for every incoming request (no body — never log request body in prod)
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`[${req.method}] ${req.originalUrl} — IP: ${req.ip}`);
  next();
});

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', environment: ENV.NODE_ENV });
});

// ── Routes (added in future sprints) ─────────────────────────────────────────
// app.use('/auth', authRoutes);
// app.use('/product', productRoutes);
// app.use('/cart', cartRoutes);
// app.use('/buy', buyRoutes);
// app.use('/users', userRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Global Error Handler (must have 4 params for Express to treat it as error handler) ──
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    success: false,
    message: ENV.IS_PRODUCTION ? 'Internal server error.' : err.message,
  });
});

export default app;