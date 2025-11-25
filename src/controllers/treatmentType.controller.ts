import { Request, Response, NextFunction } from 'express';
import * as ttService from '../services/treatmentType.service';
import { AppError } from '../utils/errors';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const types = await ttService.getAll();
        res.json(types);
    } catch (error) {
        next(error);
    }
}

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = await ttService.create(req.body.label);
        res.status(201).json(type);
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.code });
        }
        next(error);
    }
}

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = await ttService.update(req.params.id, req.body.label);
        res.json(type);
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.code });
        }
        next(error);
    }
}

export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await ttService.remove(req.params.id);
        res.status(200).json({ message: 'Treatment type deleted' });
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.code });
        }
        next(error);
    }
}

