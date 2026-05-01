import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError.ts";

export class InvalidTokenError extends AppError {
  constructor(message: string, options?: { meta?: unknown; cause?: unknown }) {
    super(message, StatusCodes.UNAUTHORIZED, {
      name: "InvalidTokenError",
      meta: options?.meta,
      cause: options?.cause,
    });
  }
}
