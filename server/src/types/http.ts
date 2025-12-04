import { Request } from "express";

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface AuthRequest<T = any> extends Request {
  user?: AuthenticatedUser;
  body: T;
}
