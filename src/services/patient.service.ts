import prisma from '../config/db';
import { Patient } from '@prisma/client';
import { AppError, ERROR_CODES } from '../utils/errors';

export const getAll = async () => {
  return prisma.patient.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

export const getById = async (id: string) => {
  return prisma.patient.findUnique({
    where: { id },
  });
};

export const create = async (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
  return prisma.$transaction(async (tx) => {
    // Check if email already exists
    if (data.email) {
      const existing = await tx.patient.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        throw new AppError(ERROR_CODES.EMAIL_ALREADY_EXISTS, 409);
      }
    }

    // Ensure dateOfBirth is a proper Date object
    const patientData = {
      ...data,
      dateOfBirth: data.dateOfBirth instanceof Date ? data.dateOfBirth : new Date(data.dateOfBirth),
    };

    const patient = await tx.patient.create({
      data: patientData,
    });

    // Side effect: Create MedicalRecord
    await tx.medicalRecord.create({
      data: {
        patientId: patient.id,
      },
    });

    return patient;
  });
};

export const update = async (id: string, data: Partial<Patient>) => {
  // Check if patient exists first
  const existing = await prisma.patient.findUnique({
    where: { id }
  });
  
  if (!existing) {
    throw new AppError(ERROR_CODES.PATIENT_NOT_FOUND, 404);
  }

  // Check if email is being updated and if it already exists for another patient
  if (data.email && data.email !== existing.email) {
    const emailExists = await prisma.patient.findUnique({
      where: { email: data.email },
    });
    if (emailExists) {
      throw new AppError(ERROR_CODES.EMAIL_ALREADY_EXISTS, 409);
    }
  }

  // Ensure dateOfBirth is a proper Date object if provided
  const updateData = {
    ...data,
    ...(data.dateOfBirth && {
      dateOfBirth: data.dateOfBirth instanceof Date ? data.dateOfBirth : new Date(data.dateOfBirth),
    }),
  };

  return prisma.patient.update({
    where: { id },
    data: updateData,
  });
};

export const remove = async (id: string) => {
  // Check if patient exists first
  const existing = await prisma.patient.findUnique({
    where: { id }
  });
  
  if (!existing) {
    throw new AppError(ERROR_CODES.PATIENT_NOT_FOUND, 404);
  }

  // MedicalRecord is set to Cascade delete in schema, so this should be safe
  return prisma.patient.delete({
    where: { id },
  });
};

