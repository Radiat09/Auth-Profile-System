"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const connectDatabase = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/auth_system";
        await mongoose_1.default.connect(mongoUri);
        console.log("MongoDB connected successfully");
        // Handle connection events
        mongoose_1.default.connection.on("error", (error) => {
            console.error("MongoDB connection error:", error);
        });
        mongoose_1.default.connection.on("disconnected", () => {
            console.log("MongoDB disconnected");
        });
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    await mongoose_1.default.disconnect();
    console.log("MongoDB disconnected");
};
exports.disconnectDatabase = disconnectDatabase;
//# sourceMappingURL=database.js.map