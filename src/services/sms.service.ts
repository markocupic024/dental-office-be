import { logger } from '../utils/logger';
import smsMessages from '../config/smsMessages.json';

/**
 * Mock SMS service - logs SMS instead of actually sending
 */
export const sendSMS = async (phoneNumber: string, message: string): Promise<void> => {
  // Mock implementation - in production, this would call a real SMS API
  logger.info(`[MOCK SMS] To: ${phoneNumber}, Message: ${message}`);
  
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
};

/**
 * Format birthday message (generic, no placeholders)
 */
export const formatBirthdayMessage = (): string => {
  return smsMessages.birthday;
};

/**
 * Format appointment reminder message
 * @param date - Appointment date (formatted as DD.MM.YYYY)
 * @param time - Appointment time
 * @param treatmentType - Treatment type label
 */
export const formatAppointmentReminder = (
  date: string,
  time: string,
  treatmentType: string
): string => {
  return smsMessages.appointmentReminder
    .replace('{date}', date)
    .replace('{time}', time)
    .replace('{treatmentType}', treatmentType);
};

/**
 * Format next-day appointments notification message
 * @param appointmentCount - Number of appointments
 * @param appointmentsList - Formatted list of appointments
 */
export const formatNextDayAppointments = (
  appointmentCount: number,
  appointmentsList: string
): string => {
  return smsMessages.nextDayAppointments
    .replace('{appointmentCount}', appointmentCount.toString())
    .replace('{appointmentsList}', appointmentsList);
};

