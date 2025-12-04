import { prisma } from "../../config/prisma";
import { signToken } from "../../utils/jwt";
import { comparePassword, hashPassword } from "../../utils/password";
import { AppError } from "../../middleware/errorHandler";

export interface SignupInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const signup = async ({ email, password, name }: SignupInput) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("Email is already registered", 400);
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  const token = signToken({ id: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email, name: user.name } };
};

export const login = async ({ email, password }: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = signToken({ id: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email, name: user.name } };
};
