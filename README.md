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
├── config/          # Configuration (env, database, swagger)
├── controllers/     # Request handlers
├── middlewares/     # Express middlewares (auth, validation, error handling)
├── routes/          # API route definitions
├── services/        # Business logic
├── types/           # TypeScript type definitions
└── utils/           # Utility functions (logger, jwt, password)
```

## Key Features

- **Authentication:** JWT-based with bcrypt password hashing
- **Validation:** Zod schemas for request validation
- **Logging:** Winston for structured logging
- **ORM:** Prisma for type-safe database access
- **Documentation:** Swagger/OpenAPI at `/api-docs`
- **Error Handling:** Centralized error handler middleware

## Database Schema

See `prisma/schema.prisma` for the complete data model including:
- Users (admin/dentist roles)
- Patients (with payroll deduction support)
- Appointments (with status tracking)
- Medical Records & Entries
- Treatment Types & Price List
- Reports (daily/weekly/monthly/payroll)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

