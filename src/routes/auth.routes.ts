import { Router } from "express";
import * as authController from "../controllers/auth.controller.ts";

const router = Router();

router.post("/login", authController.userLoginHandler);
router.post("/register", authController.userSignupHandler);
router.get('/logout', authController.userLogoutHandler);

export default router;
