import mongoose, { Document } from "mongoose";
export interface IUser extends Document {
    email?: string;
    phone?: string;
    password?: string;
    name: string;
    bio?: string;
    profilePicture?: string;
    location?: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    otp?: string;
    otpExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=user.model.d.ts.map