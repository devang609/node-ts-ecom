import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError.ts";

export class EmailAlreadyExistsError extends AppError {
  constructor(message: string, options?: { meta?: unknown; cause?: unknown }) {
    super(message, StatusCodes.CONFLICT, {
      name: "EmailAlreadyExistsError",
      meta: options?.meta,
      cause: options?.cause,
    });
  }
}
