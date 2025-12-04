import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const hashPassword = async (plain: string) => {
  return bcrypt.hash(plain, SALT_ROUNDS);
};

export const comparePassword = async (plain: string, hash: string) => {
  return bcrypt.compare(plain, hash);
};
