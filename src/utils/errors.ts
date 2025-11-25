// Error code constants
export const ERROR_CODES = {
  // Patient errors
  PATIENT_NOT_FOUND: 'PATIENT_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  
  // Appointment errors
  APPOINTMENT_NOT_FOUND: 'APPOINTMENT_NOT_FOUND',
  CANNOT_CHANGE_COMPLETED_STATUS: 'CANNOT_CHANGE_COMPLETED_STATUS',
  PATIENT_REQUIRED_FOR_COMPLETION: 'PATIENT_REQUIRED_FOR_COMPLETION',
  PAYROLL_DEDUCTION_MONTHS_REQUIRED: 'PAYROLL_DEDUCTION_MONTHS_REQUIRED',
  PAYROLL_DEDUCTION_AMOUNT_REQUIRED: 'PAYROLL_DEDUCTION_AMOUNT_REQUIRED',
  
  // Treatment type errors
  TREATMENT_TYPE_NOT_FOUND: 'TREATMENT_TYPE_NOT_FOUND',
  TREATMENT_TYPE_ALREADY_EXISTS: 'TREATMENT_TYPE_ALREADY_EXISTS',
  TREATMENT_TYPE_IN_USE_APPOINTMENTS: 'TREATMENT_TYPE_IN_USE_APPOINTMENTS',
  TREATMENT_TYPE_IN_USE_MEDICAL_RECORDS: 'TREATMENT_TYPE_IN_USE_MEDICAL_RECORDS',
  
  // Price list errors
  PRICE_LIST_ITEM_NOT_FOUND: 'PRICE_LIST_ITEM_NOT_FOUND',
  PRICE_ALREADY_EXISTS: 'PRICE_ALREADY_EXISTS',
  
  // Medical record errors
  MEDICAL_RECORD_ENTRY_NOT_FOUND: 'MEDICAL_RECORD_ENTRY_NOT_FOUND',
  
  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_DATE: 'INVALID_DATE',
  INVALID_TIME: 'INVALID_TIME',
  INVALID_UUID: 'INVALID_UUID',
  
  // Report errors
  INVALID_REPORT_TYPE: 'INVALID_REPORT_TYPE',
  
  // General errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Custom error class with error code
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;

  constructor(code: ErrorCode, statusCode: number = 500, message?: string) {
    super(message || code);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

