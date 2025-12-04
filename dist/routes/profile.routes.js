"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("../controllers/profile.controller");
const auth_1 = require("../middlewares/auth");
const upload_1 = require("../middlewares/upload");
const validation_1 = require("../middlewares/validation");
const router = (0, express_1.Router)();
// Protect all routes
router.use(auth_1.protect);
// Get profile
router.get("/", profile_controller_1.getProfile);
// Update profile
router.put("/", validation_1.validateProfileUpdate, validation_1.validateRequest, profile_controller_1.updateProfile);
// Upload profile picture
router.post("/upload-picture", upload_1.upload.single("profilePicture"), profile_controller_1.uploadProfilePicture);
// Delete profile picture
router.delete("/picture", profile_controller_1.deleteProfilePicture);
exports.default = router;
//# sourceMappingURL=profile.routes.js.map