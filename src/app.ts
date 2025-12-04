import cors from "cors";
import dotenv from "dotenv";
import express, { Application, NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";

dotenv.config();

const app: Application = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
  });
});

// Error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
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

export default app;
