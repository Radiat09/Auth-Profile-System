"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(__dirname, "../uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from uploads directory
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// Routes
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/profile", profile_routes_1.default);
// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
        path: req.path,
    });
});
// Error handler
app.use((error, req, res, next) => {
    console.error("Error:", error);
    // Handle multer file size errors
    if (error.message.includes("File too large")) {
        return res.status(400).json({
            success: false,
            error: "File size too large. Maximum size is 5MB.",
        });
    }
    // Handle multer file type errors
    if (error.message.includes("Only image files")) {
        return res.status(400).json({
            success: false,
            error: "Only image files (jpeg, jpg, png, gif, webp) are allowed.",
        });
    }
    res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map