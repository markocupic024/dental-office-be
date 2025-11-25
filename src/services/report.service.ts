import prisma from '../config/db';
import { ReportType } from '@prisma/client';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInMonths } from 'date-fns';
import { AppError, ERROR_CODES } from '../utils/errors';

export const getAll = async (type?: ReportType) => {
  const where: any = {};
  if (type) where.type = type;
  const reports = await prisma.report.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
  
  // Transform reports to include treatmentSummaries and other fields
  return reports.map(report => {
    const data = report.data as any;
    const transformed: any = {
      ...report,
      totalAmount: Number(report.totalAmount),
    };
    
    if (report.type === 'payrollDeduction') {
      transformed.payrollDeductionEntries = data || [];
      transformed.activeDeductionsCount = Array.isArray(data) ? data.length : 0;
    } else {
      // For daily, weekly, monthly reports
      transformed.treatmentSummaries = data || [];
      transformed.appointmentsCount = Array.isArray(data) 
        ? data.reduce((sum: number, item: any) => sum + (item.count || 0), 0)
        : 0;
    }
    
    return transformed;
  });
};

export const create = async (data: { type: ReportType; date: string; companyName?: string }) => {
    const reportDate = new Date(data.date);
    let startDate: Date;
    let endDate: Date;

    // Determine range
    switch (data.type) {
        case 'daily':
            startDate = startOfDay(reportDate);
            endDate = endOfDay(reportDate);
            break;
        case 'weekly':
            startDate = startOfWeek(reportDate, { weekStartsOn: 1 }); // Monday
            endDate = endOfWeek(reportDate, { weekStartsOn: 1 });
            break;
        case 'monthly':
            startDate = startOfMonth(reportDate);
            endDate = endOfMonth(reportDate);
            break;
        case 'payrollDeduction':
            // Payroll report covers all active deductions, date is reference point
            startDate = new Date(0); // Beginning of time effectively
            endDate = reportDate;
            break;
        default:
            throw new AppError(ERROR_CODES.INVALID_REPORT_TYPE, 400);
    }

    if (data.type === 'payrollDeduction') {
        return generatePayrollReport(reportDate, data.companyName);
    } else {
        return generateTreatmentReport(data.type, reportDate, startDate, endDate);
    }
};

const generateTreatmentReport = async (type: ReportType, date: Date, startDate: Date, endDate: Date) => {
    // Get completed appointments in range
    const appointments = await prisma.appointment.findMany({
        where: {
            status: 'completed',
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        include: { treatmentType: true }
    });

    // Group by treatment type and calculate sums
    // We need prices. Let's fetch all price items for lookup
    const priceItems = await prisma.priceListItem.findMany({
        include: { treatmentType: true }
    });

    const priceMap = new Map<string, number>(); // TreatmentTypeId -> Price
    priceItems.forEach(item => {
        priceMap.set(item.treatmentTypeId, Number(item.price));
    });

    const summaryMap = new Map<string, {
        treatmentType: string;
        count: number;
        price: number | null;
        total: number;
        priceExists: boolean;
    }>();

    let totalAmount = 0;

    for (const appt of appointments) {
        const typeId = appt.treatmentTypeId;
        const label = appt.treatmentType.label;
        const price = priceMap.get(typeId) || 0;
        const priceExists = priceMap.has(typeId);

        if (!summaryMap.has(label)) {
            summaryMap.set(label, {
                treatmentType: label,
                count: 0,
                price: priceExists ? price : null,
                total: 0,
                priceExists
            });
        }

        const entry = summaryMap.get(label)!;
        entry.count++;
        entry.total += price;
        totalAmount += price;
    }

    const summaries = Array.from(summaryMap.values());

    const report = await prisma.report.create({
        data: {
            type,
            date,
            startDate,
            endDate,
            totalAmount,
            data: summaries, // JSON
        }
    });
    
    // Transform report to include treatmentSummaries
    return {
        ...report,
        totalAmount: Number(report.totalAmount),
        treatmentSummaries: summaries,
        appointmentsCount: summaries.reduce((sum, item) => sum + item.count, 0),
    };
};

const generatePayrollReport = async (reportDate: Date, companyNameFilter?: string) => {
    // Find all completed appointments with payroll deduction that are active on the report date
    // An appointment is active if:
    // 1. It's completed
    // 2. It has payroll deduction
    // 3. The appointment date is on or before the report date
    // 4. There are still remaining months to pay
    const appointments = await prisma.appointment.findMany({
        where: {
            status: 'completed',
            payrollDeductionAmount: { gt: 0 },
            patientId: { not: null },
            date: { lte: reportDate } // Only appointments on or before report date
        },
        include: { 
            patient: true,
            treatmentType: true
        }
    });

    let entries = [];
    let totalReportAmount = 0; // Sum of remaining balances maybe? Or paid amount? Spec says "totalAmount: Decimal, Required" but usually specific to report.
    // For payroll report, totalAmount usually means "Total To Be Deducted" or "Total Outstanding". Let's assume Total to be deducted this month.

    for (const appt of appointments) {
        if (!appt.patient) continue;
        if (!appt.payrollDeductionMonths || appt.payrollDeductionMonths < 1) continue;
        if (companyNameFilter && appt.patient.companyName !== companyNameFilter) continue;

        const totalAmount = Number(appt.payrollDeductionAmount);
        const monthlyRate = totalAmount / appt.payrollDeductionMonths;
        
        // Calculate months passed from appointment date to report date
        // This should be >= 0 since we filtered for date <= reportDate
        const monthsPassed = differenceInMonths(reportDate, appt.date);
        
        // Ensure monthsPassed is not negative (shouldn't happen with the filter, but safety check)
        if (monthsPassed < 0) continue;

        const paidAmount = Math.min(monthlyRate * monthsPassed, totalAmount);
        const remainingMonths = appt.payrollDeductionMonths - monthsPassed;

        // Only include if there are remaining months (deduction is still active)
        if (remainingMonths > 0) {
             entries.push({
                patientId: appt.patientId,
                patientName: `${appt.patient.firstName} ${appt.patient.lastName}`,
                companyName: appt.patient.companyName,
                examinationDate: appt.date.toISOString(),
                treatmentType: appt.treatmentType.label,
                totalAmount,
                monthlyRate,
                monthsPassed,
                paidAmount,
                remainingMonths,
                totalMonths: appt.payrollDeductionMonths
             });
             totalReportAmount += monthlyRate; // Assuming report sums up "This Month's Deductions"
        }
    }

    const report = await prisma.report.create({
        data: {
            type: 'payrollDeduction',
            date: reportDate,
            startDate: reportDate, // Point in time for payroll usually
            endDate: reportDate,
            totalAmount: totalReportAmount,
            data: entries,
            companyName: companyNameFilter
        }
    });
    
    // Transform report to include payrollDeductionEntries
    return {
        ...report,
        totalAmount: Number(report.totalAmount),
        payrollDeductionEntries: entries,
        activeDeductionsCount: entries.length,
    };
}

export const remove = async (id: string) => {
    return prisma.report.delete({ where: { id } });
}

