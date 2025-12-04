import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/http";
import { verifyToken } from "../utils/jwt";

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Missing authorization header" });
  }
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing authorization header" });
  }

  try {
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid authorization header" });
    }
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
