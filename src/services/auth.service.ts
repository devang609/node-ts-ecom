import bcrypt from "bcryptjs";
import User from "../models/User.ts";
import { UserNotFoundError } from "../errors/UserNotFoundError.ts";
import { InvalidCredentialsError } from "../errors/InvalidCredentialsError.ts";
import { EmailAlreadyExistsError } from "../errors/EmailAlreadyExistsError.ts";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { date } from "joi";
import * as tokenService from '../services/token.service.ts'

export const login = async (email: string, password: string) => {

  const storedUser = await User.findOne({ where: { email } });
  if (!storedUser) throw new UserNotFoundError("User not found");

  const pswdValid = await bcrypt.compare(password, storedUser.password);
  if (!pswdValid) {
    throw new InvalidCredentialsError(
      "Invalid Credentials, check username or password",
    );
  }

  const payload = {
    email: storedUser.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "30m",
    issuer: "Devang Sharma",
    algorithm: "HS256",
    subject: storedUser.user_id,
  });

  return token;
};

export const signup = async (email: string, password: string) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new EmailAlreadyExistsError("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const createdUser = await User.create({
    email,
    password: hashedPassword,
    validAfter: new Date(Date.now())
  });

  return createdUser;
};


export const logout = async (token: string) => {

  const claims: JwtPayload = tokenService.tokenParser(token);

  const storedUser = await User.findByPk(claims.sub);

  if (!storedUser) throw new UserNotFoundError('User not found');
  else await storedUser.update({ validAfter: new Date(Date.now()) });
}