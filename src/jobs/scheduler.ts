import cron from 'node-cron';
import { logger } from '../utils/logger';
import { runBirthdaySmsJob } from './birthdaySms.job';
import { runAppointmentReminderSmsJob } from './appointmentReminderSms.job';
import { runNextDayAppointmentsSmsJob } from './nextDayAppointmentsSms.job';

/**
 * Start all scheduled SMS jobs
 */
export const startScheduler = (): void => {
  // Check if SMS is enabled
  const smsEnabled = process.env.SMS_ENABLED !== 'false'; // Default to true

  if (!smsEnabled) {
    logger.info('SMS jobs are disabled via SMS_ENABLED environment variable');
    return;
  }

  logger.info('Starting SMS job scheduler...');

  // Birthday SMS job - Daily at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    logger.info('Triggered: Birthday SMS job');
    await runBirthdaySmsJob();
  }, {
    scheduled: true,
    timezone: process.env.TIMEZONE || undefined,
  });
  logger.info('Scheduled: Birthday SMS job (daily at 8:00 AM)');

  // Appointment reminder SMS job - Daily at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    logger.info('Triggered: Appointment reminder SMS job');
    await runAppointmentReminderSmsJob();
  }, {
    scheduled: true,
    timezone: process.env.TIMEZONE || undefined,
  });
  logger.info('Scheduled: Appointment reminder SMS job (daily at 8:00 AM)');

  // Next-day appointments notification job - Daily at 9:00 PM
  cron.schedule('0 21 * * *', async () => {
    logger.info('Triggered: Next-day appointments SMS job');
    await runNextDayAppointmentsSmsJob();
  }, {
    scheduled: true,
    timezone: process.env.TIMEZONE || undefined,
  });
  logger.info('Scheduled: Next-day appointments SMS job (daily at 9:00 PM)');

  logger.info('SMS job scheduler started successfully');
};

