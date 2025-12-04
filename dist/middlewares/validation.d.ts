import { NextFunction, Request, Response } from "express";
export declare const validateRequest: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateEmailRegistration: import("express-validator").ValidationChain[];
export declare const validatePhoneRegistration: import("express-validator").ValidationChain[];
export declare const validateLogin: import("express-validator").ValidationChain[];
export declare const validateProfileUpdate: import("express-validator").ValidationChain[];
//# sourceMappingURL=validation.d.ts.map