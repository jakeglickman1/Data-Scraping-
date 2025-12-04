import { NextFunction, Request, Response } from "express";

export const asyncHandler =
  <T extends Request = Request, U extends Response = Response>(
    handler: (req: T, res: U, next: NextFunction) => Promise<unknown>,
  ) =>
  (req: T, res: U, next: NextFunction) =>
    Promise.resolve(handler(req, res, next)).catch(next);
