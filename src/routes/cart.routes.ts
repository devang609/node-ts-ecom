import { Router } from 'express';

import { getCartItems, postCart } from '../controllers/cart.controller.js';
import { auth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { getCart, upsertCart } from '../validations/cart.validation.js';

const router = Router();

router.post('/cart', auth(['BUYER']), validate(upsertCart), postCart);
router.get('/cart', auth(['BUYER']), validate(getCart), getCartItems);

export default router;
