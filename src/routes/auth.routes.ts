import { Router } from "express";
import * as authController from "../controllers/auth.controller.ts";

const router = Router();

router.post("/login", authController.userLoginHandler);
router.post("/register", authController.userSignupHandler);
router.post("/logout", authController.userLogoutHandler);
router.post("/tokenlogout", authController.userTokenLogoutHandler);

export default router;
