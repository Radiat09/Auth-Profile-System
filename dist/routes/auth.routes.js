"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_1 = require("../middlewares/validation");
const router = (0, express_1.Router)();
// Email Registration
router.post("/register/email", validation_1.validateEmailRegistration, validation_1.validateRequest, auth_controller_1.registerWithEmail);
router.post("/verify/email", validation_1.validateRequest, auth_controller_1.verifyEmailOTP);
// Phone Registration
router.post("/register/phone", validation_1.validatePhoneRegistration, validation_1.validateRequest, auth_controller_1.registerWithPhone);
router.post("/verify/phone", validation_1.validateRequest, auth_controller_1.verifyPhoneOTP);
// Login
router.post("/login/email", validation_1.validateLogin, validation_1.validateRequest, auth_controller_1.loginWithEmail);
// Phone Login (Send OTP)
router.post("/login/phone", validation_1.validateLogin, validation_1.validateRequest, auth_controller_1.loginWithPhoneOTP);
// Verify Login OTP
router.post("/login/verify", validation_1.validateLogin, validation_1.validateRequest, auth_controller_1.verifyLoginOTP);
// Resend OTP
router.post("/resend-otp", validation_1.validateRequest, auth_controller_1.resendOTP);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map