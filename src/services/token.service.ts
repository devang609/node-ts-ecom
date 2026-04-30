import jwt from "jsonwebtoken";

export const tokenParser = async (token:string) => {
    return jwt.decode(token);
}