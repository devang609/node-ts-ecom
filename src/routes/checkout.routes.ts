import { Router } from 'express';

import { postBuy } from '../controllers/checkout.controller.js';
import { auth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { buy } from '../validations/checkout.validation.js';

const router = Router();

router.post('/buy', auth(['BUYER']), validate(buy), postBuy);

export default router;

