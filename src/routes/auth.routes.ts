import { Router } from "express";
import * as authController from "../controllers/auth.controller.ts";
import { asyncHandler } from "../utils/AsyncErrorHandler.ts";

const router = Router();

router.post("/login", asyncHandler(authController.userLoginHandler));
router.post("/register", asyncHandler(authController.userSignupHandler));
router.post("/logout", asyncHandler(authController.userLogoutHandler));
router.post("/tokenlogout", asyncHandler(authController.userTokenLogoutHandler));

export default router;