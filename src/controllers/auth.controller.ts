import { Request, Response } from "express";
import twilio from "twilio";
import { isValidPhoneNumber, sendSMS } from "../config/twillio";
import { generateToken } from "../middlewares/auth";
import { User } from "../models/user.model";
import { sendEmail } from "../utils/email";
import { generateOTP, isOTPExpired } from "../utils/otp";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const registerWithEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
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
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      otp,
      otpExpires,
      isEmailVerified: false,
    });

    // Send OTP email
    await sendEmail({
      to: email,
      subject: "Your OTP Code",
      templateName: "otp",
      templateData: {
        name: name,
        otp: otp,
      },
    });

    // Generate token
    const token = generateToken(user._id.toString());

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
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Registration failed",
    });
  }
};

export const verifyEmailOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp || !user.otpExpires || isOTPExpired(user.otpExpires)) {
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
    const token = generateToken(user._id.toString());

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
  } catch (error: any) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "OTP verification failed",
    });
  }
};

export const loginWithEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

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
        error:
          "Invalid login method. Please use OTP or register with password.",
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
    const token = generateToken(user._id.toString());

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
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Login failed",
    });
  }
};

export const verifyLoginOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp || !user.otpExpires || isOTPExpired(user.otpExpires)) {
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
    const token = generateToken(user._id.toString());

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
  } catch (error: any) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Login failed",
    });
  }
};

export const registerWithPhone = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phone, name } = req.body;

    // Validate phone number format
    if (!isValidPhoneNumber(phone)) {
      res.status(400).json({
        success: false,
        error:
          "Please provide a valid phone number (E.164 format: +1234567890)",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: "User already exists with this phone number",
      });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await User.create({
      phone,
      name,
      otp,
      otpExpires,
      isPhoneVerified: false,
    });

    // Send OTP via SMS
    const message = `Your verification code is: ${otp}. It will expire in 10 minutes.`;
    const smsSent = await sendSMS(phone, message);

    if (!smsSent) {
      console.warn(`Failed to send SMS to ${phone}. OTP is: ${otp}`);
      // Still continue since user is created and OTP is saved
    }

    // Generate token
    const token = generateToken(user._id.toString());

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
  } catch (error: any) {
    console.error("Phone registration error:", error);
    res.status(500).json({
      success: false,
      error: error,
    });
  }
};

// Update the loginWithPhoneOTP function too
export const loginWithPhoneOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phone } = req.body;

    // Validate phone number
    if (!isValidPhoneNumber(phone)) {
      res.status(400).json({
        success: false,
        error: "Please provide a valid phone number",
      });
      return;
    }

    const user = await User.findOne({ phone });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found. Please register first.",
      });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to user
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via SMS
    const message = `Your login OTP code is: ${otp}. It will expire in 10 minutes.`;
    const smsSent = await sendSMS(phone, message);

    res.status(200).json({
      success: true,
      message: smsSent
        ? "OTP sent to your phone number"
        : "OTP generated successfully",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error: any) {
    console.error("Phone login error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Login failed",
    });
  }
};

// Update the resendOTP function
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone } = req.body;

    let user;
    let otp;
    let otpExpires;

    if (email) {
      user = await User.findOne({ email });
      otp = generateOTP();
      otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      if (user) {
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendEmail({
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
    } else if (phone) {
      // Validate phone number
      if (!isValidPhoneNumber(phone)) {
        res.status(400).json({
          success: false,
          error: "Please provide a valid phone number",
        });
        return;
      }

      user = await User.findOne({ phone });
      otp = generateOTP();
      otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      if (user) {
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        const message = `Your new OTP code is: ${otp}. It will expire in 10 minutes.`;
        const smsSent = await sendSMS(phone, message);

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
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to resend OTP",
    });
  }
};
export const verifyPhoneOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp || !user.otpExpires || isOTPExpired(user.otpExpires)) {
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
    const token = generateToken(user._id.toString());

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
  } catch (error: any) {
    console.error("Phone OTP verification error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "OTP verification failed",
    });
  }
};
