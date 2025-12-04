import { Router } from "express";

import {
  loginWithEmail,
  loginWithPhoneOTP,
  registerWithEmail,
  registerWithPhone,
  resendOTP,
  verifyEmailOTP,
  verifyLoginOTP,
  verifyPhoneOTP,
} from "../controllers/auth.controller";
import {
  validateEmailRegistration,
  validateLogin,
  validatePhoneRegistration,
  validateRequest,
} from "../middlewares/validation";

const router = Router();

// Email Registration
router.post(
  "/register/email",
  validateEmailRegistration,
  validateRequest,
  registerWithEmail
);

router.post("/verify/email", validateRequest, verifyEmailOTP);

// Phone Registration
router.post(
  "/register/phone",
  validatePhoneRegistration,
  validateRequest,
  registerWithPhone
);

router.post("/verify/phone", validateRequest, verifyPhoneOTP);

// Login
router.post("/login/email", validateLogin, validateRequest, loginWithEmail);

// Phone Login (Send OTP)
router.post("/login/phone", validateLogin, validateRequest, loginWithPhoneOTP);

// Verify Login OTP
router.post("/login/verify", validateLogin, validateRequest, verifyLoginOTP);

// Resend OTP
router.post("/resend-otp", validateRequest, resendOTP);

export default router;
