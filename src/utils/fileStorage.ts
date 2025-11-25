import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';
import { logger } from './logger';

const UPLOADS_BASE_DIR = path.resolve(env.UPLOADS_DIR);
const MEDICAL_RECORDS_DIR = path.join(UPLOADS_BASE_DIR, 'medical-records');

/**
 * Ensure the uploads directory structure exists
 */
export const ensureUploadsDirectory = async (): Promise<void> => {
  try {
    await fs.mkdir(MEDICAL_RECORDS_DIR, { recursive: true });
  } catch (error) {
    logger.error(`Failed to create uploads directory: ${error}`);
    throw new Error('Failed to initialize file storage');
  }
};

/**
 * Sanitize filename to prevent path traversal attacks
 */
const sanitizeFileName = (fileName: string): string => {
  // Remove path separators and dangerous characters
  return fileName
    .replace(/[\/\\]/g, '_')
    .replace(/[<>:"|?*]/g, '_')
    .replace(/\.\./g, '_')
    .trim();
};

/**
 * Generate a unique filename with timestamp
 */
const generateUniqueFileName = (entryId: string, originalFileName: string): string => {
  const sanitized = sanitizeFileName(originalFileName);
  const timestamp = Date.now();
  const ext = path.extname(sanitized);
  const nameWithoutExt = path.basename(sanitized, ext);
  return `${timestamp}-${nameWithoutExt}${ext}`;
};

/**
 * Save file to filesystem and return relative path
 */
export const saveFile = async (
  file: Buffer,
  fileName: string,
  entryId: string
): Promise<string> => {
  await ensureUploadsDirectory();

  const entryDir = path.join(MEDICAL_RECORDS_DIR, entryId);
  await fs.mkdir(entryDir, { recursive: true });

  const uniqueFileName = generateUniqueFileName(entryId, fileName);
  const filePath = path.join(entryDir, uniqueFileName);

  await fs.writeFile(filePath, file);

  // Return relative path from uploads base directory
  return path.relative(UPLOADS_BASE_DIR, filePath);
};

/**
 * Get absolute file path from relative path
 */
export const getFilePath = (relativePath: string): string => {
  return path.join(UPLOADS_BASE_DIR, relativePath);
};

/**
 * Delete file from filesystem
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const absolutePath = getFilePath(filePath);
    await fs.unlink(absolutePath);
    logger.info(`File deleted: ${absolutePath}`);
  } catch (error: any) {
    // Ignore if file doesn't exist
    if (error.code !== 'ENOENT') {
      logger.error(`Failed to delete file ${filePath}: ${error}`);
      throw error;
    }
  }
};

/**
 * Read file as buffer
 */
export const readFile = async (filePath: string): Promise<Buffer> => {
  const absolutePath = getFilePath(filePath);
  return await fs.readFile(absolutePath);
};

/**
 * Delete all files for an entry
 */
export const deleteEntryFiles = async (entryId: string): Promise<void> => {
  try {
    const entryDir = path.join(MEDICAL_RECORDS_DIR, entryId);
    await fs.rm(entryDir, { recursive: true, force: true });
    logger.info(`Deleted all files for entry: ${entryId}`);
  } catch (error: any) {
    // Ignore if directory doesn't exist
    if (error.code !== 'ENOENT') {
      logger.error(`Failed to delete entry files for ${entryId}: ${error}`);
      throw error;
    }
  }
};

