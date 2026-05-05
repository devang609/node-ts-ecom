import { Router } from 'express';

import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import productRouter from './product.routes.js';

const router = Router();

router.use(healthRouter);
router.use('/auth', authRouter);
router.use(productRouter);

export default router;
