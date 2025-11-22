import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      res.status(401).json({ error: 'Pogrešan email ili lozinka' });
    } else {
      next(error);
    }
  }
};

export const logout = (req: Request, res: Response) => {
  // Client side just removes token, server stateles jwt
  res.status(200).json({ message: 'Logged out' });
};

export const me = (req: Request, res: Response) => {
  res.status(200).json({ user: req.user });
};

