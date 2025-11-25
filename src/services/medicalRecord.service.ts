import prisma from '../config/db';
import { MedicalRecordEntry, Prisma } from '@prisma/client';
import { AppError, ERROR_CODES } from '../utils/errors';

export const getByPatientId = async (patientId: string) => {
  let record = await prisma.medicalRecord.findUnique({
    where: { patientId },
    include: { 
      entries: { 
        orderBy: { date: 'desc' },
        include: { treatmentType: true }
      } 
    },
  });

  // Fallback if somehow not created (though patient creation handles it)
  if (!record) {
    record = await prisma.medicalRecord.create({
      data: { patientId },
      include: { 
        entries: { 
          orderBy: { date: 'desc' },
          include: { treatmentType: true }
        } 
      },
    });
  }

  return record;
};

export const getEntries = async (medicalRecordId: string) => {
    return prisma.medicalRecordEntry.findMany({
        where: { medicalRecordId },
        include: { treatmentType: true },
        orderBy: { date: 'desc' }
    });
}

export const createEntry = async (data: Omit<MedicalRecordEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
  // Ensure date is a proper Date object
  // Handle attachedFile: Prisma JSON fields need special handling for null
  const entryData = {
    ...data,
    date: data.date instanceof Date ? data.date : new Date(data.date),
    attachedFile: data.attachedFile === null ? Prisma.JsonNull : data.attachedFile,
  };

  return prisma.medicalRecordEntry.create({
    data: entryData,
    include: { treatmentType: true },
  });
};

export const updateEntry = async (id: string, data: Partial<MedicalRecordEntry>) => {
  // Check if entry exists first
  const existing = await prisma.medicalRecordEntry.findUnique({
    where: { id }
  });
  
  if (!existing) {
    throw new AppError(ERROR_CODES.MEDICAL_RECORD_ENTRY_NOT_FOUND, 404);
  }

  // Ensure date is a proper Date object if provided
  // Handle attachedFile: Prisma JSON fields need special handling for null
  const updateData = Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (key === 'date' && value) {
        return [key, value instanceof Date ? value : new Date(value as string)];
      }
      if (key === 'attachedFile' && value !== undefined) {
        return [key, value === null ? Prisma.JsonNull : value];
      }
      return [key, value];
    })
  )

  return prisma.medicalRecordEntry.update({
    where: { id },
    data: updateData,
    include: { treatmentType: true },
  });
};

