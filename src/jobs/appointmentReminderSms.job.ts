import { logger } from '../utils/logger';
import { format } from 'date-fns';
import { getAppointmentsForToday } from '../services/smsQueries.service';
import { sendSMS, formatAppointmentReminder } from '../services/sms.service';

/**
 * Appointment reminder SMS job - runs daily at 8:00 AM
 * Sends reminders to patients with appointments scheduled for today
 */
export const runAppointmentReminderSmsJob = async (): Promise<void> => {
  try {
    logger.info('Starting appointment reminder SMS job...');
    
    const appointments = await getAppointmentsForToday();
    logger.info(`Found ${appointments.length} appointments scheduled for today`);

    if (appointments.length === 0) {
      logger.info('No appointments scheduled for today. Job completed.');
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    for (const appointment of appointments) {
      try {
        // Skip appointments without patients
        if (!appointment.patient) {
          logger.warn(`Appointment ${appointment.id} has no patient, skipping`);
          failureCount++;
          continue;
        }

        // Skip if patient has no phone number
        if (!appointment.patient.phone) {
          logger.warn(`Patient ${appointment.patient.id} has no phone number, skipping`);
          failureCount++;
          continue;
        }

        // Format date as DD.MM.YYYY
        const dateStr = format(new Date(appointment.date), 'dd.MM.yyyy');
        const treatmentType = appointment.treatmentType?.label || '';

        const message = formatAppointmentReminder(
          dateStr,
          appointment.time,
          treatmentType
        );

        await sendSMS(appointment.patient.phone, message);
        successCount++;
        logger.info(`Appointment reminder SMS sent to patient ${appointment.patient.id} (${appointment.patient.phone})`);
      } catch (error: any) {
        failureCount++;
        logger.error(`Failed to send appointment reminder SMS for appointment ${appointment.id}: ${error.message}`);
      }
    }

    logger.info(`Appointment reminder SMS job completed. Success: ${successCount}, Failures: ${failureCount}`);
  } catch (error: any) {
    logger.error(`Appointment reminder SMS job failed: ${error.message}`);
    if (error.stack) {
      logger.error(error.stack);
    }
  }
};

