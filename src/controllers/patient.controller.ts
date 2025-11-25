import { Request, Response, NextFunction } from 'express';
import * as patientService from '../services/patient.service';
import { AppError, ERROR_CODES } from '../utils/errors';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patients = await patientService.getAll();
    res.json(patients);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patient = await patientService.getById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: ERROR_CODES.PATIENT_NOT_FOUND });
    }
    res.json(patient);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patient = await patientService.create(req.body);
    res.status(201).json(patient);
  } catch (error: any) {
    if (error.code === 'P2002') {
        return res.status(409).json({ error: ERROR_CODES.EMAIL_ALREADY_EXISTS });
    }
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patient = await patientService.update(req.params.id, req.body);
    res.json(patient);
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.code });
    }
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await patientService.remove(req.params.id);
    res.status(200).json({ message: 'Patient deleted' });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.code });
    }
    next(error);
  }
};

