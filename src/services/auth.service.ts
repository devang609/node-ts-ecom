import bcrypt from "bcryptjs";
import User from "../models/User.ts";
import { UserNotFoundError } from "../errors/UserNotFoundError.ts";
import { InvalidCredentialsError } from "../errors/InvalidCredentialsError.ts";
import { EmailAlreadyExistsError } from "../errors/EmailAlreadyExistsError.ts";
import jwt, { TokenExpiredError, type JwtPayload , JsonWebTokenError} from "jsonwebtoken";
import { date, number } from "joi";
import * as tokenService from '../services/token.service.ts'
import { env } from "../configs/env.ts";

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

  const token = jwt.sign(payload, env.jwt.secret, {
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

  const claims: JwtPayload = tokenService.getJwtClaims(token, { ignoreExpiration: true });

  const storedUser = await User.findByPk(claims.sub);

  if (!storedUser) throw new UserNotFoundError('User not found');
  else return await storedUser.update({ validAfter: new Date() });
}

export const tokenRefresh = async (jwtClaims: JwtPayload) => {
  
  const isExpired = jwtClaims.exp! * 1000 < Date.now();
  if(isExpired) throw new TokenExpiredError('Token expired at: ', new Date(jwtClaims.exp!*1000));

  const storedUser = await User.findByPk(jwtClaims.sub);
  if(!storedUser) throw new JsonWebTokenError('Invalid Token: No such user exists.');

  return jwt.sign(storedUser.email, env.jwt.secret, {
    expiresIn: jwtClaims.exp!,
    issuer: jwtClaims.iss!,
    algorithm: "HS256",
    subject: jwtClaims.sub!,
  });
}
