import prisma from '../config/db';
import { Appointment } from '@prisma/client';

export const getAll = async (startDate?: string, endDate?: string) => {
  const where: any = {};
  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }
  return prisma.appointment.findMany({
    where,
    include: { 
      patient: true,
      treatmentType: true 
    },
    orderBy: { date: 'asc' },
  });
};

export const getById = async (id: string) => {
  return prisma.appointment.findUnique({
    where: { id },
    include: { 
      patient: true,
      treatmentType: true 
    },
  });
};

export const create = async (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
  // RULE: Block creating appointment with "completed" status without patient
  if (data.status === 'completed' && !data.patientId) {
    throw new Error('Patient is required to mark appointment as completed');
  }

  // Ensure date is a proper Date object
  const appointmentData = {
    ...data,
    date: data.date instanceof Date ? data.date : new Date(data.date),
  };

  // If creating with completed status, create medical record entry
  if (data.status === 'completed' && data.patientId) {
    return prisma.$transaction(async (tx) => {
      const patient = await tx.patient.findUnique({ where: { id: data.patientId! }});
      if (!patient) throw new Error('Patient not found');

      if (patient.hasPayrollDeduction) {
        const months = data.payrollDeductionMonths;
        const amount = data.payrollDeductionAmount;
        
        if (!months || months < 1) {
          throw new Error('Payroll deduction months required for this patient');
        }
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
          throw new Error('Payroll deduction amount is required and must be a positive number for this patient');
        }
      }

      // Create appointment
      const appointment = await tx.appointment.create({
        data: appointmentData,
        include: { 
          patient: true,
          treatmentType: true 
        },
      });

      // Ensure Medical Record exists
      let medicalRecord = await tx.medicalRecord.findUnique({ where: { patientId: data.patientId! }});
      if (!medicalRecord) {
        medicalRecord = await tx.medicalRecord.create({ data: { patientId: data.patientId! }});
      }

      // Create Entry
      const entryDate = appointmentData.date instanceof Date ? appointmentData.date : new Date(appointmentData.date);
      await tx.medicalRecordEntry.create({
        data: {
          medicalRecordId: medicalRecord.id,
          appointmentId: appointment.id,
          treatmentTypeId: appointmentData.treatmentTypeId,
          date: entryDate,
          doctorReport: appointmentData.notes || ''
        }
      });

      return appointment;
    });
  }

  return prisma.appointment.create({
    data: appointmentData,
    include: { 
      patient: true,
      treatmentType: true 
    },
  });
};

export const update = async (id: string, data: Partial<Appointment>) => {
  // Transactional update for side effects
  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findUnique({ where: { id } });
    if (!appointment) throw new Error('Appointment not found');

    // RULE 1: Block status change if already "completed"
    if (appointment.status === 'completed' && data.status && data.status !== 'completed') {
        throw new Error('Cannot change status of a completed appointment');
    }

    // RULE 2: Block setting status to "completed" without patient
    const finalPatientId = data.patientId !== undefined ? data.patientId : appointment.patientId;
    if (data.status === 'completed' && !finalPatientId) {
        throw new Error('Patient is required to mark appointment as completed');
    }

    // Logic if status is changing to completed
    if (data.status === 'completed' && appointment.status !== 'completed') {
        const patientId = finalPatientId!; // Already validated above

        const patient = await tx.patient.findUnique({ where: { id: patientId }});
        if (!patient) throw new Error('Patient not found');

        if (patient.hasPayrollDeduction) {
            const months = data.payrollDeductionMonths || appointment.payrollDeductionMonths;
            const amount = data.payrollDeductionAmount || appointment.payrollDeductionAmount;
            
            if (!months || months < 1) {
                throw new Error('Payroll deduction months required for this patient');
            }
             // Amount is usually set by frontend, strictly we should ensure it's there
             if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
                 throw new Error('Payroll deduction amount is required and must be a positive number for this patient');
             }
        }

        // Ensure Medical Record exists
        let medicalRecord = await tx.medicalRecord.findUnique({ where: { patientId }});
        if (!medicalRecord) {
            medicalRecord = await tx.medicalRecord.create({ data: { patientId }});
        }

        // Create Entry if not exists
        const existingEntry = await tx.medicalRecordEntry.findFirst({
            where: { appointmentId: id }
        });

        if (!existingEntry) {
            // Ensure date is a proper Date object
            const entryDate = data.date 
                ? (data.date instanceof Date ? data.date : new Date(data.date))
                : (appointment.date instanceof Date ? appointment.date : new Date(appointment.date));
            
            await tx.medicalRecordEntry.create({
                data: {
                    medicalRecordId: medicalRecord.id,
                    appointmentId: id,
                    treatmentTypeId: data.treatmentTypeId || appointment.treatmentTypeId,
                    date: entryDate,
                    doctorReport: data.notes || appointment.notes || ''
                }
            });
        }
    }

    // Ensure date is a proper Date object if provided
    const updateData = {
        ...data,
        ...(data.date && {
            date: data.date instanceof Date ? data.date : new Date(data.date),
        }),
    };

    return tx.appointment.update({
        where: { id },
        data: updateData,
        include: { 
          patient: true,
          treatmentType: true 
        }
    });
  });
};

export const remove = async (id: string) => {
  // Check if appointment exists first
  const existing = await prisma.appointment.findUnique({
    where: { id }
  });
  
  if (!existing) {
    throw new Error('Appointment not found');
  }

  return prisma.appointment.delete({
    where: { id },
  });
};

