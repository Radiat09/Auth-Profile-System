"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPhoneNumber = exports.sendSMS = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const twilio_1 = __importDefault(require("twilio"));
dotenv_1.default.config();
// Check if Twilio is configured
const isTwilioConfigured = process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER;
let client = null;
if (isTwilioConfigured) {
    client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}
const sendSMS = async (phoneNumber, message) => {
    if (!isTwilioConfigured) {
        console.log("Twilio not configured. SMS would be:", {
            phoneNumber,
            message,
        });
        return true; // Return true for development
    }
    if (!client) {
        console.error("Twilio client not initialized");
        return false;
    }
    try {
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });
        console.log(`SMS sent to ${phoneNumber}`);
        return true;
    }
    catch (error) {
        console.error("SMS sending failed:", error.message);
        return false;
    }
};
exports.sendSMS = sendSMS;
const isValidPhoneNumber = (phoneNumber) => {
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
};
exports.isValidPhoneNumber = isValidPhoneNumber;
//# sourceMappingURL=twillio.js.map