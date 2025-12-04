"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOTPExpired = exports.generateOTP = void 0;
const generateOTP = (length = 6) => {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};
exports.generateOTP = generateOTP;
const isOTPExpired = (expiryDate) => {
    return new Date() > expiryDate;
};
exports.isOTPExpired = isOTPExpired;
//# sourceMappingURL=otp.js.map