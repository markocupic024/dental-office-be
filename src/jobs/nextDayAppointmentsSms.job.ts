import { logger } from '../utils/logger';
import { format } from 'date-fns';
import { getAppointmentsForTomorrow, getAllUsers } from '../services/smsQueries.service';
import { sendSMS, formatNextDayAppointments } from '../services/sms.service';

/**
 * Next-day appointments notification SMS job - runs daily at 9:00 PM
 * Sends notifications to users (admins/dentists) about appointments scheduled for tomorrow
 */
export const runNextDayAppointmentsSmsJob = async (): Promise<void> => {
  try {
    logger.info('Starting next-day appointments SMS job...');
    
    const appointments = await getAppointmentsForTomorrow();
    logger.info(`Found ${appointments.length} appointments scheduled for tomorrow`);

    const users = await getAllUsers();
    logger.info(`Found ${users.length} users to notify`);

    if (appointments.length === 0) {
      logger.info('No appointments scheduled for tomorrow. Job completed.');
      return;
    }

    if (users.length === 0) {
      logger.warn('No users found to notify. Job completed.');
      return;
    }

    // Format appointments list (time and treatment type, no patient names)
    const appointmentsList = appointments
      .map((apt, index) => {
        const time = apt.time;
        const treatmentType = apt.treatmentType?.label || 'Nepoznat tip tretmana';
        return `${index + 1}. ${time} - ${treatmentType}`;
      })
      .join('\n');

    const message = formatNextDayAppointments(appointments.length, appointmentsList);

    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
      try {
        // In real implementation, users would have phone numbers
        // For now, we'll use a mock phone number based on user email or ID
        const mockPhone = `+381600000000`; // Mock phone number
        
        await sendSMS(mockPhone, message);
        successCount++;
        logger.info(`Next-day appointments SMS sent to user ${user.id} (${user.email})`);
      } catch (error: any) {
        failureCount++;
        logger.error(`Failed to send next-day appointments SMS to user ${user.id}: ${error.message}`);
      }
    }

    logger.info(`Next-day appointments SMS job completed. Success: ${successCount}, Failures: ${failureCount}`);
  } catch (error: any) {
    logger.error(`Next-day appointments SMS job failed: ${error.message}`);
    if (error.stack) {
      logger.error(error.stack);
    }
  }
};

