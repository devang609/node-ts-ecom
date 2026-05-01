import { StatusCodes } from "http-status-codes";

export type AppErrorOptions = {
  name?: string;
  meta?: unknown;
  cause?: unknown;
};

export class AppError extends Error {
  statusCode: StatusCodes;
  meta?: unknown;

  constructor(
    message: string,
    statusCode: StatusCodes,
    options?: AppErrorOptions,
  ) {
    super(message, options?.cause ? { cause: options.cause as any } : undefined);

    this.name = options?.name ?? "AppError";
    this.statusCode = statusCode;
    this.meta = options?.meta;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

