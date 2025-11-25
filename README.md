# Dental Office Backend

Express.js + TypeScript + Prisma backend for the Dental Office application.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dental_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   PORT=3000
   NODE_ENV=development
   ```

3. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

4. **Seed the database:**
   ```bash
   npm run seed
   ```
   This creates:
   - Admin user: `admin@dental.com` / `admin123`
   - Dentist user: `dentist@dental.com` / `dentist123`
   - Basic treatment types

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## API Documentation

Once running, visit `http://localhost:3000/api-docs` for Swagger documentation.

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed database with initial data
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations

## Project Structure

```
src/
├── config/          # Configuration (env, database, swagger, SMS messages)
├── controllers/     # Request handlers
├── jobs/            # Background job definitions (SMS scheduler)
├── middlewares/     # Express middlewares (auth, validation, error handling)
├── routes/          # API route definitions
├── services/        # Business logic (including SMS and file storage)
├── types/           # TypeScript type definitions
└── utils/           # Utility functions (logger, jwt, password, file storage)
```

## Key Features

- **Authentication:** JWT-based with bcrypt password hashing
- **Validation:** Zod schemas for request validation
- **Logging:** Winston for structured logging
- **ORM:** Prisma for type-safe database access
- **Documentation:** Swagger/OpenAPI at `/api-docs`
- **Error Handling:** Centralized error handler middleware
- **File Storage:** Filesystem-based file storage for medical record attachments
- **SMS Background Jobs:** Automated SMS notifications for birthdays, appointment reminders, and next-day appointments

## Database Schema

See `prisma/schema.prisma` for the complete data model including:
- Users (admin/dentist roles)
- Patients (with payroll deduction support)
- Appointments (with status tracking)
- Medical Records & Entries (with file attachments)
- Medical Record Files (filesystem-based file storage)
- Treatment Types & Price List
- Reports (daily/weekly/monthly/payroll)

## SMS Background Jobs

The application includes automated SMS notification jobs that run on a schedule:

### Scheduled Jobs

1. **Birthday SMS** - Daily at 8:00 AM
   - Sends generic birthday message to all patients whose birthday is today
   - Message template: `src/config/smsMessages.json`

2. **Appointment Reminders** - Daily at 8:00 AM
   - Sends reminders to patients with appointments scheduled for today
   - Includes date, time, and treatment type

3. **Next-Day Appointments Notification** - Daily at 9:00 PM
   - Sends notifications to users (admins/dentists) about appointments scheduled for tomorrow
   - Includes appointment count and list with times and treatment types

### Configuration

- **Enable/Disable:** Set `SMS_ENABLED=false` in `.env` to disable all SMS jobs
- **Timezone:** Set `TIMEZONE` environment variable (e.g., `Europe/Belgrade`) for job scheduling
- **Message Templates:** Edit `src/config/smsMessages.json` to customize SMS messages (all in Serbian)

### Mock SMS Service

Currently, SMS sending is implemented as a mock service that logs messages to the console. To integrate with a real SMS provider:

1. Update `src/services/sms.service.ts`
2. Replace the `sendSMS()` function with your SMS API integration
3. Messages are logged with format: `[MOCK SMS] To: {phone}, Message: {message}`

### Job Logging

All SMS job executions are logged using Winston:
- Job start/completion
- Number of messages sent
- Success/failure counts
- Error details

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `UPLOADS_DIR` | Directory for file uploads | `./uploads` |
| `MAX_FILE_SIZE` | Maximum file size in bytes | `10485760` (10MB) |
| `TIMEZONE` | Timezone for scheduled jobs (e.g., "Europe/Belgrade") | Server timezone |
| `SMS_ENABLED` | Enable/disable SMS background jobs | `true` (set to `false` to disable) |

