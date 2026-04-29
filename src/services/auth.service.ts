import bcrypt from "bcryptjs"
import User from "../models/User"
import { UserNotFoundError } from "../errors/UserNotFoundError";
import { InvalidCredentialsError } from "../errors/InvalidCredentialsError";
import jwt from "jsonwebtoken";
import config from "dotenv/config.js";

export const login = async (email: string, hashedPassword: string) => {

    const storedUser = await User.findOne({ where: { email } });
    if (!storedUser) throw new UserNotFoundError('User with this email not found');
    if (!bcrypt.compare(storedUser.password, hashedPassword)) throw new InvalidCredentialsError('Invalid Credentials, check username or password');

    const payload = {
        email: storedUser.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: '30m',
        issuer: 'Devang Sharma',
        algorithm: 'ES256',
        subject: storedUser.user_id,
        notBefore: Date.now()
    })


}