import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError.ts";

export class InvalidCredentialsError extends AppError {
  constructor(message: string, options?: { meta?: unknown; cause?: unknown }) {
    super(message, StatusCodes.UNAUTHORIZED, {
      name: "InvalidCredentialsError",
      meta: options?.meta,
      cause: options?.cause,
    });
  }
}
