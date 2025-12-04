import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthenticatedUser } from "../types/http";

interface TokenPayload extends AuthenticatedUser {
  iat?: number;
  exp?: number;
}

const { JWT_SECRET } = env;

export const signToken = (payload: AuthenticatedUser) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

export const verifyToken = (token: string): TokenPayload =>
  jwt.verify(token, JWT_SECRET) as TokenPayload;
