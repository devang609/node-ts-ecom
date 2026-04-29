import Router from "express";
import authController from '../controllers/auth.controller'

export const router  = express.Router();

router.post('/login', authController.userLoginHandler());
router.post('/register', authController.userSignupHandler());


export default router;