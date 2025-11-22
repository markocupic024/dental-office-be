import prisma from '../config/db';
import { comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';

export const login = async (credentials: {email: string, password: string}) => {
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await comparePassword(credentials.password, user.passwordHash);

  if (!isValid) {
    throw new Error('Invalid credentials');
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

