import prisma from '../config/db';
import { MedicalRecordEntry, Prisma } from '@prisma/client';
import { AppError, ERROR_CODES } from '../utils/errors';
import { saveFile, deleteFile, deleteEntryFiles } from '../utils/fileStorage';

export const getByPatientId = async (patientId: string) => {
  let record = await prisma.medicalRecord.findUnique({
    where: { patientId },
    include: { 
      entries: { 
        orderBy: { date: 'desc' },
        include: { 
          treatmentType: true,
          files: true
        }
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
          include: { 
            treatmentType: true,
            files: true
          }
        } 
      },
    });
  }

  return record;
};

export const getEntries = async (medicalRecordId: string) => {
    return prisma.medicalRecordEntry.findMany({
        where: { medicalRecordId },
        include: { 
          treatmentType: true,
          files: true
        },
        orderBy: { date: 'desc' }
    });
}

export const createEntry = async (data: Omit<MedicalRecordEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
  // Ensure date is a proper Date object
  const entryData = {
    ...data,
    date: data.date instanceof Date ? data.date : new Date(data.date),
  };

  return prisma.medicalRecordEntry.create({
    data: entryData,
    include: { 
      treatmentType: true,
      files: true
    },
  });
};

export const updateEntry = async (id: string, data: Partial<Omit<MedicalRecordEntry, 'id' | 'createdAt' | 'updatedAt'>>) => {
  // Check if entry exists first
  const existing = await prisma.medicalRecordEntry.findUnique({
    where: { id }
  });
  
  if (!existing) {
    throw new AppError(ERROR_CODES.MEDICAL_RECORD_ENTRY_NOT_FOUND, 404);
  }

  // Ensure date is a proper Date object if provided
  // Handle optional string fields: convert empty strings to null for clearing
  const updateData = Object.fromEntries(
    Object.entries(data)
      .filter(([_, value]) => value !== undefined) // Remove undefined values
      .map(([key, value]) => {
        if (key === 'date' && value) {
          return [key, value instanceof Date ? value : new Date(value as string)];
        }
        // Convert empty strings to null for optional string fields (doctorReport)
        if ((key === 'doctorReport') && value === '') {
          return [key, null];
        }
        return [key, value];
      })
  );

  return prisma.medicalRecordEntry.update({
    where: { id },
    data: updateData,
    include: { 
      treatmentType: true,
      files: true
    },
  });
};

/**
 * Add a file to a medical record entry
 */
export const addFile = async (
  entryId: string,
  fileData: { fileName: string; fileType: string; fileSize: number; buffer: Buffer }
) => {
  // Check if entry exists
  const entry = await prisma.medicalRecordEntry.findUnique({
    where: { id: entryId }
  });

  if (!entry) {
    throw new AppError(ERROR_CODES.MEDICAL_RECORD_ENTRY_NOT_FOUND, 404);
  }

  // Save file to filesystem
  const filePath = await saveFile(fileData.buffer, fileData.fileName, entryId);

  // Create database record
  return prisma.medicalRecordFile.create({
    data: {
      medicalRecordEntryId: entryId,
      fileName: fileData.fileName,
      filePath: filePath,
      fileType: fileData.fileType,
      fileSize: fileData.fileSize,
    },
  });
};

/**
 * Get all files for a medical record entry
 */
export const getFiles = async (entryId: string) => {
  return prisma.medicalRecordFile.findMany({
    where: { medicalRecordEntryId: entryId },
    orderBy: { uploadedAt: 'desc' },
  });
};

/**
 * Get a single file by ID
 */
export const getFileById = async (fileId: string) => {
  const file = await prisma.medicalRecordFile.findUnique({
    where: { id: fileId }
  });

  if (!file) {
    throw new AppError(ERROR_CODES.MEDICAL_RECORD_FILE_NOT_FOUND, 404);
  }

  return file;
};

/**
 * Delete a file
 */
export const deleteFileRecord = async (fileId: string) => {
  const file = await prisma.medicalRecordFile.findUnique({
    where: { id: fileId }
  });

  if (!file) {
    throw new AppError(ERROR_CODES.MEDICAL_RECORD_ENTRY_NOT_FOUND, 404);
  }

  // Delete physical file
  await deleteFile(file.filePath);

  // Delete database record
  await prisma.medicalRecordFile.delete({
    where: { id: fileId }
  });
};

/**
 * Delete all files for an entry (called when entry is deleted)
 */
export const deleteFilesByEntryId = async (entryId: string) => {
  // Delete physical files
  await deleteEntryFiles(entryId);

  // Delete database records (CASCADE should handle this, but we'll do it explicitly)
  await prisma.medicalRecordFile.deleteMany({
    where: { medicalRecordEntryId: entryId }
  });
};

