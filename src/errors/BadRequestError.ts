import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError.ts";

export class BadRequestError extends AppError {
  constructor(message: string, options?: { meta?: unknown; cause?: unknown }) {
    super(message, StatusCodes.BAD_REQUEST, {
      name: "BadRequestError",
      meta: options?.meta,
      cause: options?.cause,
    });
  }
}
