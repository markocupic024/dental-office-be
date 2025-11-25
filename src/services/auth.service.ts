import prisma from '../config/db';
import { comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AppError, ERROR_CODES } from '../utils/errors';

export const login = async (credentials: {email: string, password: string}) => {
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (!user) {
    throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 401);
  }

  const isValid = await comparePassword(credentials.password, user.passwordHash);

  if (!isValid) {
    throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 401);
  }

  const token = signToken({ id: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
};

