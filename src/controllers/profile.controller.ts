import dotenv from "dotenv";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { User } from "../models/user.model";

dotenv.config();

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -otp -otpExpires"
    );

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Format profile picture URL
    const profileData = user.toObject();
    if (
      profileData.profilePicture &&
      !profileData.profilePicture.startsWith("http")
    ) {
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      profileData.profilePicture = `${appUrl}${profileData.profilePicture}`;
    }

    res.status(200).json({
      success: true,
      data: profileData,
    });
  } catch (error: any) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get profile",
    });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, bio, location } = req.body;

    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;

    // Find and update user
    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -otp -otpExpires");

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Format profile picture URL
    const userData = user.toObject();
    if (
      userData.profilePicture &&
      !userData.profilePicture.startsWith("http")
    ) {
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      userData.profilePicture = `${appUrl}${userData.profilePicture}`;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userData,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update profile",
    });
  }
};

export const uploadProfilePicture = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: "Please upload an image file",
      });
      return;
    }

    // Get current user to check existing profile picture
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Delete old profile picture if exists
    if (currentUser.profilePicture) {
      const oldFilePath = path.join(
        __dirname,
        "../../uploads/profile-pictures",
        path.basename(currentUser.profilePicture)
      );
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Create file path for database
    const filePath = `/uploads/profile-pictures/${req.file.filename}`;
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const fullUrl = `${appUrl}${filePath}`;

    // Update user profile picture
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: filePath },
      { new: true }
    ).select("-password -otp -otpExpires");

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    const userData = user.toObject();
    userData.profilePicture = fullUrl;

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: {
        profilePicture: fullUrl,
        user: userData,
      },
    });
  } catch (error: any) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to upload profile picture",
    });
  }
};

export const deleteProfilePicture = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Delete file from filesystem if exists
    if (user.profilePicture) {
      const filePath = path.join(
        __dirname,
        "../../uploads/profile-pictures",
        path.basename(user.profilePicture)
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Update user to remove profile picture
    user.profilePicture = "";
    await user.save();

    const userData = user.toObject();
    delete userData.password;
    delete userData.otp;
    delete userData.otpExpires;

    res.status(200).json({
      success: true,
      message: "Profile picture removed successfully",
      data: userData,
    });
  } catch (error: any) {
    console.error("Delete profile picture error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to remove profile picture",
    });
  }
};
