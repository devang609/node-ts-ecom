import type { Request, Response } from "express";
import * as authService from "../services/auth.service.ts";
import {
    loginValidationSchema,
    signupValidationSchema,
} from "../validations/auth.validations.ts";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors/BadRequestError.ts";
import * as tokenService from "../services/token.service.ts";

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
        return res.status(caught.statusCode).json({ caught });
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
        return res.status(caught.statusCode).json({ caught });
    }
};


export const userLogoutHandler = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        if (!token) throw new BadRequestError('access_token not found');

        const jwtClaims = tokenService.tokenParser(token);


    } catch (error) {

    }
}