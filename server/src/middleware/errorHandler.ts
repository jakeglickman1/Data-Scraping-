import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const status = err instanceof AppError ? err.statusCode : 500;
  const payload = {
    message: err.message || "Something went wrong",
    ...(env.isProduction ? {} : { stack: err.stack }),
  };

  if (!env.isProduction) {
    console.error(err);
  }

  res.status(status).json(payload);
};
