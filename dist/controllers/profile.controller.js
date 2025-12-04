"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProfilePicture = exports.uploadProfilePicture = exports.updateProfile = exports.getProfile = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const user_model_1 = require("../models/user.model");
dotenv_1.default.config();
const getProfile = async (req, res) => {
    try {
        const user = await user_model_1.User.findById(req.user.id).select("-password -otp -otpExpires");
        if (!user) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }
        // Format profile picture URL
        const profileData = user.toObject();
        if (profileData.profilePicture &&
            !profileData.profilePicture.startsWith("http")) {
            const appUrl = process.env.APP_URL || "http://localhost:3000";
            profileData.profilePicture = `${appUrl}${profileData.profilePicture}`;
        }
        res.status(200).json({
            success: true,
            data: profileData,
        });
    }
    catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to get profile",
        });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const { name, bio, location } = req.body;
        // Build update object
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (bio !== undefined)
            updateData.bio = bio;
        if (location !== undefined)
            updateData.location = location;
        // Find and update user
        const user = await user_model_1.User.findByIdAndUpdate(req.user.id, updateData, {
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
        if (userData.profilePicture &&
            !userData.profilePicture.startsWith("http")) {
            const appUrl = process.env.APP_URL || "http://localhost:3000";
            userData.profilePicture = `${appUrl}${userData.profilePicture}`;
        }
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: userData,
        });
    }
    catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to update profile",
        });
    }
};
exports.updateProfile = updateProfile;
const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                error: "Please upload an image file",
            });
            return;
        }
        // Get current user to check existing profile picture
        const currentUser = await user_model_1.User.findById(req.user.id);
        if (!currentUser) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }
        // Delete old profile picture if exists
        if (currentUser.profilePicture) {
            const oldFilePath = path_1.default.join(__dirname, "../../uploads/profile-pictures", path_1.default.basename(currentUser.profilePicture));
            if (fs_1.default.existsSync(oldFilePath)) {
                fs_1.default.unlinkSync(oldFilePath);
            }
        }
        // Create file path for database
        const filePath = `/uploads/profile-pictures/${req.file.filename}`;
        const appUrl = process.env.APP_URL || "http://localhost:3000";
        const fullUrl = `${appUrl}${filePath}`;
        // Update user profile picture
        const user = await user_model_1.User.findByIdAndUpdate(req.user.id, { profilePicture: filePath }, { new: true }).select("-password -otp -otpExpires");
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
    }
    catch (error) {
        console.error("Upload profile picture error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to upload profile picture",
        });
    }
};
exports.uploadProfilePicture = uploadProfilePicture;
const deleteProfilePicture = async (req, res) => {
    try {
        const user = await user_model_1.User.findById(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }
        // Delete file from filesystem if exists
        if (user.profilePicture) {
            const filePath = path_1.default.join(__dirname, "../../uploads/profile-pictures", path_1.default.basename(user.profilePicture));
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
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
    }
    catch (error) {
        console.error("Delete profile picture error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to remove profile picture",
        });
    }
};
exports.deleteProfilePicture = deleteProfilePicture;
//# sourceMappingURL=profile.controller.js.map