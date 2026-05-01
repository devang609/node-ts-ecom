import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError.ts";

export class UserNotFoundError extends AppError {
  constructor(message: string, options?: { meta?: unknown; cause?: unknown }) {
    super(message, StatusCodes.NOT_FOUND, {
      name: "UserNotFoundError",
      meta: options?.meta,
      cause: options?.cause,
    });
  }
}
