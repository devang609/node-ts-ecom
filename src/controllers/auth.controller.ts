import type { Request, Response } from "express";
import * as authService from "../services/auth.service.ts";
import {
    loginValidationSchema,
    signupValidationSchema,
} from "../validations/auth.validations.ts";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors/BadRequestError.ts";

const getTokenFromRequest = (req: Request): string | undefined => {
    const authHeader = req.headers.authorization;
    if (typeof authHeader === "string") {
        const match = authHeader.match(/^Bearer\s+(.+)$/i);
        if (match?.[1]) return match[1].trim();
    }

    const bodyToken = (req.body as any)?.token;
    if (typeof bodyToken === "string" && bodyToken.trim()) return bodyToken.trim();

    return undefined;
};

const sendControllerError = (res: Response, caught: any) => {
    const statusCode =
        typeof caught?.statusCode === "number"
            ? caught.statusCode
            : StatusCodes.INTERNAL_SERVER_ERROR;
    const message = typeof caught?.message === "string" ? caught.message : "Internal Server Error";
    return res.status(statusCode).json({ message });
};

export const userLoginHandler = async (req: Request, res: Response) => {
    const { error } = loginValidationSchema.validate(req.body);
    if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }

    const { email, password } = req.body as { email: string; password: string };

    try {
        const token = await authService.login(email, password);
        return res.status(StatusCodes.OK).json({ token });
    } catch (caught: any) {
        return sendControllerError(res, caught);
    }
};

export const userSignupHandler = async (req: Request, res: Response) => {
    const { error } = signupValidationSchema.validate(req.body);

    if (error) return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });

    const { email, password } = req.body as { email: string; password: string };

    try {
        const createdUser = await authService.signup(email, password);
        return res.status(StatusCodes.CREATED).json({
            "user_id": createdUser.user_id,
            "email": createdUser.email
        });
    } catch (caught: any) {
        return sendControllerError(res, caught);
    }
};


export const userLogoutHandler = async (req: Request, res: Response) => {
    try {
        const token = getTokenFromRequest(req);
        if (!token) throw new BadRequestError("access_token not found");

        await authService.logout(token);
        return res.status(StatusCodes.OK).json({ message: "Logged out" });
    } catch (caught: any) {
        return sendControllerError(res, caught);
    }
}

export const userTokenLogoutHandler = async (req: Request, res: Response) => {
    try {
        const { token } = req.body as { token?: string };
        if (!token) throw new BadRequestError("access_token not found");

        await authService.logout(token);
        return res.status(StatusCodes.OK).json({ message: "Logged out" });
    } catch (caught: any) {
        return sendControllerError(res, caught);
    }
};
