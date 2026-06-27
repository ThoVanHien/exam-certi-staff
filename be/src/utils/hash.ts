import bcrypt from "bcryptjs";

export const hashPassword = async (plainText: string): Promise<string> => {
  return bcrypt.hash(plainText, 12);
};

export const comparePassword = async (
  plainText: string,
  passwordHash: string
): Promise<boolean> => {
  return bcrypt.compare(plainText, passwordHash);
};
