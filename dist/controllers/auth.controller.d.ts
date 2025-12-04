import { Request, Response } from "express";
export declare const registerWithEmail: (req: Request, res: Response) => Promise<void>;
export declare const verifyEmailOTP: (req: Request, res: Response) => Promise<void>;
export declare const loginWithEmail: (req: Request, res: Response) => Promise<void>;
export declare const verifyLoginOTP: (req: Request, res: Response) => Promise<void>;
export declare const registerWithPhone: (req: Request, res: Response) => Promise<void>;
export declare const loginWithPhoneOTP: (req: Request, res: Response) => Promise<void>;
export declare const resendOTP: (req: Request, res: Response) => Promise<void>;
export declare const verifyPhoneOTP: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map