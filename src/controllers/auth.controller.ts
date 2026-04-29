import type { Request, Response } from "express";
import authService from '../services/auth.service'
import { loginValidationSchema, signupValidationSchema } from "../validations/auth.validations";
import HttpStatus from 'http-status-codes';  // Import HTTP status codes
import User from "../models/User";
import bcrypt from "bcryptjs";


export const userLogin: (req: Request, res: Response) => {

    const error = loginValidationSchema.validate(req.body);
    if (error) res.status(HttpStatus.BAD_REQUEST).json(error);

    //destructuring the request body
    const { email, password } = req.body;
    
    try {
        
        const token = await authService.login(email, bcrypt.hash(password, 12));
        res.status(HttpStatus.OK).json(token);
        
    } catch (error) {
        res.status().json(error);
    }
};


export const userSignupHandler: Response(req: Request, res: Response) => {
    
    const error = loginValidationSchema.validate(req.body);
    if (error) res.status(HttpStatus.BAD_REQUEST).json(error);
    
    const { email, password } = req.body;

    try {

        const createdUser: User = await authService.signup(email, password);
        res.status(HttpStatus.CREATED).json(createdUser);

    } catch (error) {
        res.status(HttpStatus.CONFLICT).json(error);
    }
};
