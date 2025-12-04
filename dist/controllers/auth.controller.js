"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPhoneOTP = exports.resendOTP = exports.loginWithPhoneOTP = exports.registerWithPhone = exports.verifyLoginOTP = exports.loginWithEmail = exports.verifyEmailOTP = exports.registerWithEmail = void 0;
const twilio_1 = __importDefault(require("twilio"));
const twillio_1 = require("../config/twillio");
const auth_1 = require("../middlewares/auth");
const user_model_1 = require("../models/user.model");
const email_1 = require("../utils/email");
const otp_1 = require("../utils/otp");
const client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const registerWithEmail = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        // Check if user already exists
        const existingUser = await user_model_1.User.findOne({
            $or: [{ email }, { email: email?.toLowerCase() }],
        });
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: "User already exists with this email",
            });
            return;
        }
        // Generate OTP
        const otp = (0, otp_1.generateOTP)();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Create user
        const user = await user_model_1.User.create({
            email,
            password,
            name,
            otp,
            otpExpires,
            isEmailVerified: false,
        });
        // Send OTP email
        await (0, email_1.sendEmail)({
            to: email,
            subject: "Your OTP Code",
            templateName: "otp",
            templateData: {
                name: name,
                otp: otp,
            },
        });
        // Generate token
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.status(201).json({
            success: true,
            message: "Registration successful. Please verify your email with OTP.",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                isEmailVerified: user.isEmailVerified,
            },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Registration failed",
        });
    }
};
exports.registerWithEmail = registerWithEmail;
const verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await user_model_1.User.findOne({ email });
        if (!user) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }
        // Check if OTP matches and is not expired
        if (user.otp !== otp || !user.otpExpires || (0, otp_1.isOTPExpired)(user.otpExpires)) {
            res.status(400).json({
                success: false,
                error: "Invalid or expired OTP",
            });
            return;
        }
        // Update user verification status
        user.isEmailVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        // Generate new token
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                isEmailVerified: user.isEmailVerified,
            },
        });
    }
    catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "OTP verification failed",
        });
    }
};
exports.verifyEmailOTP = verifyEmailOTP;
const loginWithEmail = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await user_model_1.User.findOne({ email }).select("+password");
        if (!user) {
            res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
            return;
        }
        // Check if user has password (email registration)
        if (!user.password) {
            res.status(401).json({
                success: false,
                error: "Invalid login method. Please use OTP or register with password.",
            });
            return;
        }
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
            return;
        }
        // Generate token
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                isEmailVerified: user.isEmailVerified,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Login failed",
        });
    }
};
exports.loginWithEmail = loginWithEmail;
const verifyLoginOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const user = await user_model_1.User.findOne({ phone });
        if (!user) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }
        // Check if OTP matches and is not expired
        if (user.otp !== otp || !user.otpExpires || (0, otp_1.isOTPExpired)(user.otpExpires)) {
            res.status(400).json({
                success: false,
                error: "Invalid or expired OTP",
            });
            return;
        }
        // Clear OTP
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        // Generate token
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                phone: user.phone,
                name: user.name,
                isPhoneVerified: user.isPhoneVerified,
            },
        });
    }
    catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Login failed",
        });
    }
};
exports.verifyLoginOTP = verifyLoginOTP;
const registerWithPhone = async (req, res) => {
    try {
        const { phone, name } = req.body;
        // Validate phone number format
        if (!(0, twillio_1.isValidPhoneNumber)(phone)) {
            res.status(400).json({
                success: false,
                error: "Please provide a valid phone number (E.164 format: +1234567890)",
            });
            return;
        }
        // Check if user already exists
        const existingUser = await user_model_1.User.findOne({ phone });
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: "User already exists with this phone number",
            });
            return;
        }
        // Generate OTP
        const otp = (0, otp_1.generateOTP)();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Create user
        const user = await user_model_1.User.create({
            phone,
            name,
            otp,
            otpExpires,
            isPhoneVerified: false,
        });
        // Send OTP via SMS
        const message = `Your verification code is: ${otp}. It will expire in 10 minutes.`;
        const smsSent = await (0, twillio_1.sendSMS)(phone, message);
        if (!smsSent) {
            console.warn(`Failed to send SMS to ${phone}. OTP is: ${otp}`);
            // Still continue since user is created and OTP is saved
        }
        // Generate token
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.status(201).json({
            success: true,
            message: smsSent
                ? "Registration successful. Please verify your phone with OTP sent via SMS."
                : "Registration successful. OTP generation completed.",
            otp: process.env.NODE_ENV === "development" ? otp : undefined, // Only show OTP in dev
            token,
            user: {
                id: user._id,
                phone: user.phone,
                name: user.name,
                isPhoneVerified: user.isPhoneVerified,
            },
        });
    }
    catch (error) {
        console.error("Phone registration error:", error);
        res.status(500).json({
            success: false,
            error: error,
        });
    }
};
exports.registerWithPhone = registerWithPhone;
// Update the loginWithPhoneOTP function too
const loginWithPhoneOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        // Validate phone number
        if (!(0, twillio_1.isValidPhoneNumber)(phone)) {
            res.status(400).json({
                success: false,
                error: "Please provide a valid phone number",
            });
            return;
        }
        const user = await user_model_1.User.findOne({ phone });
        if (!user) {
            res.status(404).json({
                success: false,
                error: "User not found. Please register first.",
            });
            return;
        }
        // Generate OTP
        const otp = (0, otp_1.generateOTP)();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        // Save OTP to user
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
        // Send OTP via SMS
        const message = `Your login OTP code is: ${otp}. It will expire in 10 minutes.`;
        const smsSent = await (0, twillio_1.sendSMS)(phone, message);
        res.status(200).json({
            success: true,
            message: smsSent
                ? "OTP sent to your phone number"
                : "OTP generated successfully",
            otp: process.env.NODE_ENV === "development" ? otp : undefined,
        });
    }
    catch (error) {
        console.error("Phone login error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Login failed",
        });
    }
};
exports.loginWithPhoneOTP = loginWithPhoneOTP;
// Update the resendOTP function
const resendOTP = async (req, res) => {
    try {
        const { email, phone } = req.body;
        let user;
        let otp;
        let otpExpires;
        if (email) {
            user = await user_model_1.User.findOne({ email });
            otp = (0, otp_1.generateOTP)();
            otpExpires = new Date(Date.now() + 10 * 60 * 1000);
            if (user) {
                user.otp = otp;
                user.otpExpires = otpExpires;
                await user.save();
                await (0, email_1.sendEmail)({
                    to: email,
                    subject: "Your OTP Code",
                    templateName: "otp",
                    templateData: {
                        name: "",
                        otp: otp,
                    },
                });
                res.status(200).json({
                    success: true,
                    message: "OTP resent to your email",
                    otp: process.env.NODE_ENV === "development" ? otp : undefined,
                });
                return;
            }
        }
        else if (phone) {
            // Validate phone number
            if (!(0, twillio_1.isValidPhoneNumber)(phone)) {
                res.status(400).json({
                    success: false,
                    error: "Please provide a valid phone number",
                });
                return;
            }
            user = await user_model_1.User.findOne({ phone });
            otp = (0, otp_1.generateOTP)();
            otpExpires = new Date(Date.now() + 10 * 60 * 1000);
            if (user) {
                user.otp = otp;
                user.otpExpires = otpExpires;
                await user.save();
                const message = `Your new OTP code is: ${otp}. It will expire in 10 minutes.`;
                const smsSent = await (0, twillio_1.sendSMS)(phone, message);
                res.status(200).json({
                    success: true,
                    message: smsSent
                        ? "OTP resent to your phone"
                        : "OTP regenerated successfully",
                    otp: process.env.NODE_ENV === "development" ? otp : undefined,
                });
                return;
            }
        }
        if (!user) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }
    }
    catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to resend OTP",
        });
    }
};
exports.resendOTP = resendOTP;
const verifyPhoneOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const user = await user_model_1.User.findOne({ phone });
        if (!user) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }
        // Check if OTP matches and is not expired
        if (user.otp !== otp || !user.otpExpires || (0, otp_1.isOTPExpired)(user.otpExpires)) {
            res.status(400).json({
                success: false,
                error: "Invalid or expired OTP",
            });
            return;
        }
        // Update user verification status
        user.isPhoneVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        // Generate new token
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.status(200).json({
            success: true,
            message: "Phone verified successfully",
            token,
            user: {
                id: user._id,
                phone: user.phone,
                name: user.name,
                isPhoneVerified: user.isPhoneVerified,
            },
        });
    }
    catch (error) {
        console.error("Phone OTP verification error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "OTP verification failed",
        });
    }
};
exports.verifyPhoneOTP = verifyPhoneOTP;
//# sourceMappingURL=auth.controller.js.map