import { Router } from 'express';

import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import productRouter from './product.routes.js';
import cartRouter from './cart.routes.js';

const router = Router();

router.use(healthRouter);
router.use('/auth', authRouter);
router.use(productRouter);
router.use(cartRouter);

export default router;
