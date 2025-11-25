import { Request, Response, NextFunction } from 'express';
import * as reportService from '../services/report.service';
import { AppError } from '../utils/errors';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.query;
        const reports = await reportService.getAll(type as any);
        res.json(reports);
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.code });
        }
        next(error);
    }
}

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const report = await reportService.create(req.body);
        res.status(201).json(report);
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.code });
        }
        next(error);
    }
}

export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await reportService.remove(req.params.id);
        res.status(200).json({ message: 'Report deleted' });
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.code });
        }
        next(error);
    }
}

