import { Router } from 'express';

import { auth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as adminUserValidation from '../validations/adminUser.validation.js';
import * as adminUserController from '../controllers/adminUser.controller.js';

const router = Router();

router.get('/users', auth(['ADMIN']), validate(adminUserValidation.listUsers), adminUserController.listUsers);
router.get('/users/:userId', auth(['ADMIN']), validate(adminUserValidation.getUserById), adminUserController.getUserById);
router.post('/users', auth(['ADMIN']), validate(adminUserValidation.createUser), adminUserController.postUser);
router.patch('/users/:userId', auth(['ADMIN']), validate(adminUserValidation.updateUser), adminUserController.patchUser);
router.delete('/users/:userId', auth(['ADMIN']), validate(adminUserValidation.deleteUser), adminUserController.deleteUser);

export default router;
