import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export const signToken = (payload: object): string => {
  return jwt.sign(payload, env.JWT_SECRET);
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

