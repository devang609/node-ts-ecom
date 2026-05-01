import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import type Joi from "joi";
import { AppError } from "../errors/AppError.ts";

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => unknown | Promise<unknown>;

type AppErrorLike = {
  statusCode: number;
  message: string;
  name?: string;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isAppErrorLike = (err: unknown): err is AppErrorLike => {
  if (!isObject(err)) return false;
  return (
    typeof err.statusCode === "number" &&
    Number.isFinite(err.statusCode) &&
    typeof err.message === "string"
  );
};

const isJoiError = (err: unknown): err is Joi.ValidationError => {
  if (!isObject(err)) return false;
  return (err as any).isJoi === true && Array.isArray((err as any).details);
};

export const asyncHandler =
  (fn: AsyncRouteHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const GlobalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.meta !== undefined ? { meta: err.meta } : {}),
    });
  }

  // Custom application errors (src/errors/*) typically expose `statusCode`.
  if (isAppErrorLike(err)) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Joi validation errors (when schemas are used directly)
  if (isJoiError(err)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Validation error",
      details: err.details.map((d) => ({
        message: d.message,
        path: d.path,
        type: d.type,
      })),
    });
  }

  // JWT errors (jsonwebtoken)
  if (err?.name === "TokenExpiredError") {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Token expired" });
  }

  if (
    err?.name === "JsonWebTokenError" ||
    err?.name === "NotBeforeError"
  ) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid token" });
  }

  // Body parsing errors (invalid JSON)
  if (
    err instanceof SyntaxError &&
    isObject(err) &&
    (err as any).type === "entity.parse.failed"
  ) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid JSON body" });
  }

  // Sequelize errors (best-effort without importing sequelize classes at runtime)
  if (typeof err?.name === "string" && err.name.startsWith("Sequelize")) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Unique constraint violation" });
    }

    if (err.name === "SequelizeValidationError") {
      const errors = Array.isArray((err as any).errors)
        ? (err as any).errors
        : [];
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Database validation error",
        details: errors.map((e: any) => ({
          message: e?.message,
          path: e?.path,
          validatorKey: e?.validatorKey,
          type: e?.type,
        })),
      });
    }

    if (
      err.name === "SequelizeForeignKeyConstraintError" ||
      err.name === "SequelizeExclusionConstraintError" ||
      err.name === "SequelizeUnknownConstraintError"
    ) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Database constraint error" });
    }
  }

  console.error(err);

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
  });
};
