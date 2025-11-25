import { Request, Response, NextFunction } from 'express';
import * as mrService from '../services/medicalRecord.service';
import { AppError, ERROR_CODES } from '../utils/errors';
import { readFile } from '../utils/fileStorage';

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
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.code });
    }
    next(error);
  }
};

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: ERROR_CODES.VALIDATION_ERROR });
    }

    const file = await mrService.addFile(req.params.entryId, {
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      buffer: req.file.buffer,
    });

    res.status(201).json(file);
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.code });
    }
    // Handle multer errors
    if (error.message === 'File too large') {
      return res.status(400).json({ error: ERROR_CODES.FILE_TOO_LARGE });
    }
    if (error.message === 'Invalid file type') {
      return res.status(400).json({ error: ERROR_CODES.INVALID_FILE_TYPE });
    }
    next(error);
  }
};

export const downloadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await mrService.getFileById(req.params.fileId);

    // Get file from filesystem
    const fileBuffer = await readFile(file.filePath);

    // Set headers for file download
    res.setHeader('Content-Type', file.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.setHeader('Content-Length', file.fileSize);

    res.send(fileBuffer);
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.code });
    }
    next(error);
  }
};

export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await mrService.deleteFileRecord(req.params.fileId);
    res.json({ message: 'File deleted successfully' });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.code });
    }
    next(error);
  }
};

