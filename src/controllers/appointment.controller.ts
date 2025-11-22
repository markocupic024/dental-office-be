import { Request, Response, NextFunction } from 'express';
import * as appointmentService from '../services/appointment.service';

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
        if (!appointment) return res.status(404).json({ error: 'Not found' });
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
        if (error.message === 'Patient is required to mark appointment as completed') {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
}

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const appointment = await appointmentService.update(req.params.id, req.body);
        res.json(appointment);
    } catch (error: any) {
        // Handle specific business rule errors with proper status codes
        if (error.message === 'Appointment not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Cannot change status of a completed appointment') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Patient is required to mark appointment as completed') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Patient not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Cannot complete appointment without a patient' ||
            error.message === 'Payroll deduction months required for this patient') {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
}

export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await appointmentService.remove(req.params.id);
        res.status(200).json({ message: 'Appointment deleted' });
    } catch (error: any) {
        if (error.message === 'Appointment not found') {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
}

