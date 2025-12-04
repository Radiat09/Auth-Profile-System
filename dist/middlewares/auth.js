"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET || "secret", {
        expiresIn: process.env.JWT_EXPIRE || "7d",
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "secret");
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization) {
        token = req.headers.authorization;
    }
    if (!token) {
        res.status(401).json({
            success: false,
            error: "Not authorized to access this route",
        });
        return;
    }
    try {
        const decoded = (0, exports.verifyToken)(token);
        const user = await user_model_1.User.findById(decoded.id).select("-password -otp");
        if (!user) {
            res.status(401).json({
                success: false,
                error: "User not found",
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: "Not authorized to access this route",
        });
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authorized",
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: `Role ${req.user.role} is not authorized to access this route`,
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map