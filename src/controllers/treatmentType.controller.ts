import { Request, Response, NextFunction } from 'express';
import * as ttService from '../services/treatmentType.service';

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
        if (error.message === 'Treatment type already exists') {
            return res.status(409).json({ error: error.message });
        }
        next(error);
    }
}

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = await ttService.update(req.params.id, req.body.label);
        res.json(type);
    } catch (error: any) {
        if (error.message === 'Treatment type not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Treatment type with this label already exists') {
            return res.status(409).json({ error: error.message });
        }
        next(error);
    }
}

export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await ttService.remove(req.params.id);
        res.status(200).json({ message: 'Treatment type deleted' });
    } catch (error: any) {
        if (error.message === 'Treatment type not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Cannot delete treatment type used in appointments' ||
            error.message === 'Cannot delete treatment type used in medical records') {
            return res.status(409).json({ error: error.message });
        }
        next(error);
    }
}

