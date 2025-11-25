import prisma from '../config/db';
import { startOfToday, startOfTomorrow, endOfTomorrow } from 'date-fns';

/**
 * Get patients whose birthday is today (compare month and day only)
 */
export const getPatientsWithBirthdayToday = async () => {
  const today = new Date();
  const todayMonth = today.getMonth() + 1; // getMonth() returns 0-11
  const todayDay = today.getDate();

  // Get all patients and filter by birthday month and day
  const allPatients = await prisma.patient.findMany();
  
  return allPatients.filter(patient => {
    const birthDate = new Date(patient.dateOfBirth);
    const birthMonth = birthDate.getMonth() + 1;
    const birthDay = birthDate.getDate();
    return birthMonth === todayMonth && birthDay === todayDay;
  });
};

/**
 * Get appointments scheduled for today with status 'scheduled'
 */
export const getAppointmentsForToday = async () => {
  const today = startOfToday();
  const tomorrow = startOfTomorrow();

  return prisma.appointment.findMany({
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      },
      status: 'scheduled',
    },
    include: {
      patient: true,
      treatmentType: true,
    },
  });
};

/**
 * Get appointments scheduled for tomorrow with status 'scheduled'
 */
export const getAppointmentsForTomorrow = async () => {
  const tomorrow = startOfTomorrow();
  const dayAfterTomorrow = endOfTomorrow();

  return prisma.appointment.findMany({
    where: {
      date: {
        gte: tomorrow,
        lt: dayAfterTomorrow,
      },
      status: 'scheduled',
    },
    include: {
      patient: true,
      treatmentType: true,
    },
  });
};

/**
 * Get all users (admin and dentist roles)
 */
export const getAllUsers = async () => {
  return prisma.user.findMany({
    where: {
      role: {
        in: ['admin', 'dentist'],
      },
    },
  });
};

