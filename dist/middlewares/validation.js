"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProfileUpdate = exports.validateLogin = exports.validatePhoneRegistration = exports.validateEmailRegistration = exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            errors: errors.array(),
        });
        return;
    }
    next();
};
exports.validateRequest = validateRequest;
exports.validateEmailRegistration = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required").trim().escape(),
];
exports.validatePhoneRegistration = [
    (0, express_validator_1.body)("phone")
        .notEmpty()
        .withMessage("Phone number is required")
        .matches(/^\+?[1-9]\d{1,14}$/)
        .withMessage("Please provide a valid phone number"),
    (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required").trim().escape(),
];
exports.validateLogin = [
    (0, express_validator_1.body)("email")
        .optional()
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),
    (0, express_validator_1.body)("phone")
        .optional()
        .matches(/^\+?[1-9]\d{1,14}$/)
        .withMessage("Please provide a valid phone number"),
    (0, express_validator_1.body)("password")
        .optional()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    (0, express_validator_1.body)("otp")
        .optional()
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be 6 digits"),
];
exports.validateProfileUpdate = [
    (0, express_validator_1.body)("name").optional().trim().escape(),
    (0, express_validator_1.body)("bio")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Bio cannot exceed 500 characters")
        .trim()
        .escape(),
    (0, express_validator_1.body)("location").optional().trim().escape(),
];
//# sourceMappingURL=validation.js.map