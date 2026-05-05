import { Router } from 'express';

import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import productRouter from './product.routes.js';
import cartRouter from './cart.routes.js';
import checkoutRouter from './checkout.routes.js';
import adminUserRouter from './adminUser.routes.js';

const router = Router();

router.use(healthRouter);
router.use('/auth', authRouter);
router.use(productRouter);
router.use(cartRouter);
router.use(checkoutRouter);
router.use(adminUserRouter);

export default router;
