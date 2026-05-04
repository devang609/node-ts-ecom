import { register, login, logout, refresh } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema } from '../validations/auth.validation';

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refresh);


export default router;