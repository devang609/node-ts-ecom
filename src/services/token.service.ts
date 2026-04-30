import jwt, { type JwtPayload } from "jsonwebtoken";
import { InvalidTokenError } from "../errors/InvalidTokenError.ts";

const JWT_ISSUER = "Devang Sharma";

export const getJwtClaims = (
  token: string,
  options?: { ignoreExpiration?: boolean },
): JwtPayload => {
  if (!token || typeof token !== "string") {
    throw new InvalidTokenError("Token not provided");
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      ignoreExpiration: options?.ignoreExpiration ?? false,
    });

    if (typeof verified === "string" || !verified) {
      throw new InvalidTokenError("Invalid token payload");
    }

    return verified as JwtPayload;
  } catch (caught: any) {
    const message = caught?.message ? String(caught.message) : "Invalid token";
    throw new InvalidTokenError(message);
  }
};
