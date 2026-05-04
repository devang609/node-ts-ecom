import { Router } from 'express';

import { validate } from '../middlewares/validate.js';
import { auth } from '../middlewares/auth.js';
import * as authValidation from '../validations/auth.validation.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/refresh', validate(authValidation.refresh), authController.refresh);
router.post('/logout', validate(authValidation.logout), auth(['BUYER', 'SELLER', 'ADMIN']), authController.logout);

export default router;

