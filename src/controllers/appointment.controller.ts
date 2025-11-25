import { Request, Response, NextFunction } from 'express';
import * as appointmentService from '../services/appointment.service';
import { AppError, ERROR_CODES } from '../utils/errors';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;
        const appointments = await appointmentService.getAll(
            startDate as string,
            endDate as string
        );
        res.json(appointments);
    } catch (error) {
        next(error);
    }
}

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const appointment = await appointmentService.getById(req.params.id);
        if (!appointment) return res.status(404).json({ error: ERROR_CODES.NOT_FOUND });
        res.json(appointment);
    } catch (error) {
        next(error);
    }
}

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const appointment = await appointmentService.create(req.body);
        res.status(201).json(appointment);
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.code });
        }
        next(error);
    }
}

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const appointment = await appointmentService.update(req.params.id, req.body);
        res.json(appointment);
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.code });
        }
        next(error);
    }
}

export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await appointmentService.remove(req.params.id);
        res.status(200).json({ message: 'Appointment deleted' });
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.code });
        }
        next(error);
    }
}

