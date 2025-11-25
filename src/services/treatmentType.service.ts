import prisma from '../config/db';
import { AppError, ERROR_CODES } from '../utils/errors';

export const getAll = async () => {
  return prisma.treatmentType.findMany({
    orderBy: { label: 'asc' },
  });
};

export const create = async (label: string) => {
  // Check case-insensitive unique
  const existing = await prisma.treatmentType.findFirst({
    where: {
      label: {
        equals: label,
        mode: 'insensitive',
      },
    },
  });

  if (existing) {
    throw new AppError(ERROR_CODES.TREATMENT_TYPE_ALREADY_EXISTS, 409);
  }

  return prisma.treatmentType.create({
    data: { label },
  });
};

export const update = async (id: string, label: string) => {
  // Check if treatment type exists
  const type = await prisma.treatmentType.findUnique({ where: { id }});
  if (!type) {
    throw new AppError(ERROR_CODES.TREATMENT_TYPE_NOT_FOUND, 404);
  }

  // Check unique exclude current
  const existing = await prisma.treatmentType.findFirst({
    where: {
      label: {
        equals: label,
        mode: 'insensitive',
      },
      id: { not: id }
    },
  });

  if (existing) {
    throw new AppError(ERROR_CODES.TREATMENT_TYPE_ALREADY_EXISTS, 409);
  }

  return prisma.treatmentType.update({
    where: { id },
    data: { label },
  });
};

export const remove = async (id: string) => {
    // Check if treatment type exists
    const type = await prisma.treatmentType.findUnique({ where: { id }});
    if (!type) throw new AppError(ERROR_CODES.TREATMENT_TYPE_NOT_FOUND, 404);

    // Check usage in Appointments (now by ID reference)
    const usageCount = await prisma.appointment.count({
        where: { treatmentTypeId: id }
    });

    if (usageCount > 0) {
        throw new AppError(ERROR_CODES.TREATMENT_TYPE_IN_USE_APPOINTMENTS, 409);
    }

    // Check usage in Medical Record Entries
    const medicalRecordUsage = await prisma.medicalRecordEntry.count({
        where: { treatmentTypeId: id }
    });

    if (medicalRecordUsage > 0) {
        throw new AppError(ERROR_CODES.TREATMENT_TYPE_IN_USE_MEDICAL_RECORDS, 409);
    }

    return prisma.treatmentType.delete({
        where: { id }
    });
}

