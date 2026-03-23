import { Request, Response, NextFunction } from "express";
import { Error } from "mongoose";
import AppError from "./ApplicationError";
import { logger } from "../../utils/logger";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Mongoose validation error
  if (err instanceof Error.ValidationError) {
    logger.warn("Validation error", {
      path: _req.originalUrl,
      method: _req.method,
      message: err.message,
    });
    return res.status(400).json({
      message: err.message,
      errors: err.errors,
    });
  }

  // Custom app errors
  if (err instanceof AppError) {
    const { statusCode, message } = err;
    logger.warn("Application error", {
      path: _req.originalUrl,
      method: _req.method,
      statusCode,
      message,
    });
    return res.status(statusCode).json({
      message,
    });
  }

  // Unknown errors — only expose raw message in dev
  const isDev = process.env.ENVIRONMENT === "dev";
  logger.error("Unhandled error", {
    path: _req.originalUrl,
    method: _req.method,
    message: err.message,
    stack: isDev ? err.stack : undefined,
  });
  res.status(500).json({
    message: isDev ? (err.message ?? "Internal server error") : "Internal server error",
  });
};
