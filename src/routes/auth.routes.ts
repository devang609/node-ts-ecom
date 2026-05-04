import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema } from '../validations/auth.validation';

// Tighter rate limit scoped to auth routes only — these are the primary
// brute-force target. Global limiter (100/15min) still applies on top.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login',    authRateLimiter, validate(loginSchema),    login);

export default router;