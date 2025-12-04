import { Router } from "express";
import {
  deleteProfilePicture,
  getProfile,
  updateProfile,
  uploadProfilePicture,
} from "../controllers/profile.controller";

import { protect } from "../middlewares/auth";
import { upload } from "../middlewares/upload";
import {
  validateProfileUpdate,
  validateRequest,
} from "../middlewares/validation";

const router = Router();

// Protect all routes
router.use(protect);

// Get profile
router.get("/", getProfile);

// Update profile
router.put("/", validateProfileUpdate, validateRequest, updateProfile);

// Upload profile picture
router.post(
  "/upload-picture",
  upload.single("profilePicture"),
  uploadProfilePicture
);

// Delete profile picture
router.delete("/picture", deleteProfilePicture);

export default router;
