import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

// Check if Twilio is configured
const isTwilioConfigured =
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_PHONE_NUMBER;

let client: any = null;

if (isTwilioConfigured) {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

export const sendSMS = async (
  phoneNumber: string,
  message: string
): Promise<boolean> => {
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
  } catch (error: any) {
    console.error("SMS sending failed:", error.message);
    return false;
  }
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // Basic phone number validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};
