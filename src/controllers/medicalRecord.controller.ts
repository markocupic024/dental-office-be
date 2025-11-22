import { Request, Response, NextFunction } from 'express';
import * as mrService from '../services/medicalRecord.service';

export const getByPatientId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await mrService.getByPatientId(req.params.patientId);
    res.json(record);
  } catch (error) {
    next(error);
  }
};

export const getEntries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entries = await mrService.getEntries(req.params.id); // This is technically redundant if we include in getByPatientId, but spec has endpoint
    res.json(entries);
  } catch (error) {
    next(error);
  }
};

export const createEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await mrService.createEntry(req.body);
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
};

export const updateEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await mrService.updateEntry(req.params.id, req.body);
    res.json(entry);
  } catch (error: any) {
    if (error.message === 'Medical record entry not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

