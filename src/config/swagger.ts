import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dental Office API',
      version: '1.0.0',
      description: 'Backend API for Dental Office Application',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /auth/login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'dentist'] },
          },
        },
        Patient: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            address: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            hasPayrollDeduction: { type: 'boolean' },
            companyName: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            patientId: { type: 'string', format: 'uuid' },
            date: { type: 'string', format: 'date' },
            time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
            treatmentType: { type: 'string' },
            status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled'] },
            notes: { type: 'string' },
            payrollDeductionMonths: { type: 'integer' },
            payrollDeductionAmount: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        TreatmentType: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            label: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        PriceListItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            treatmentTypeId: { type: 'string', format: 'uuid' },
            price: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Patients', description: 'Patient management' },
      { name: 'Appointments', description: 'Appointment management' },
      { name: 'Medical Records', description: 'Medical records and entries' },
      { name: 'Treatment Types', description: 'Treatment type management' },
      { name: 'Price List', description: 'Price list management' },
      { name: 'Reports', description: 'Report generation' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/routes/*.js'],
};

export const specs = swaggerJsdoc(options);

