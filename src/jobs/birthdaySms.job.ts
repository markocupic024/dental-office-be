import { logger } from '../utils/logger';
import { getPatientsWithBirthdayToday } from '../services/smsQueries.service';
import { sendSMS, formatBirthdayMessage } from '../services/sms.service';

/**
 * Birthday SMS job - runs daily at 8:00 AM
 * Sends generic birthday message to all patients whose birthday is today
 */
export const runBirthdaySmsJob = async (): Promise<void> => {
  try {
    logger.info('Starting birthday SMS job...');
    
    const patients = await getPatientsWithBirthdayToday();
    logger.info(`Found ${patients.length} patients with birthday today`);

    if (patients.length === 0) {
      logger.info('No patients with birthday today. Job completed.');
      return;
    }

    const message = formatBirthdayMessage();
    let successCount = 0;
    let failureCount = 0;

    for (const patient of patients) {
      try {
        if (!patient.phone) {
          logger.warn(`Patient ${patient.id} has no phone number, skipping`);
          failureCount++;
          continue;
        }

        await sendSMS(patient.phone, message);
        successCount++;
        logger.info(`Birthday SMS sent to patient ${patient.id} (${patient.phone})`);
      } catch (error: any) {
        failureCount++;
        logger.error(`Failed to send birthday SMS to patient ${patient.id}: ${error.message}`);
      }
    }

    logger.info(`Birthday SMS job completed. Success: ${successCount}, Failures: ${failureCount}`);
  } catch (error: any) {
    logger.error(`Birthday SMS job failed: ${error.message}`);
    if (error.stack) {
      logger.error(error.stack);
    }
  }
};

