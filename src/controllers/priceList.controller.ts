import { Request, Response, NextFunction } from 'express';
import * as priceService from '../services/priceList.service';
import { AppError } from '../utils/errors';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await priceService.getAll();
        res.json(items);
    } catch (error) {
        next(error);
    }
}

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await priceService.create(req.body);
        res.status(201).json(item);
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.code });
        }
        next(error);
    }
}

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await priceService.update(req.params.id, req.body.price);
        res.json(item);
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.code });
        }
        next(error);
    }
}

export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await priceService.remove(req.params.id);
        res.status(200).json({ message: 'Price list item deleted' });
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.code });
        }
        next(error);
    }
}

