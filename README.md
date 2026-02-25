# KSAA STEMCARE Patient Management System

A premium healthcare portal for stem cell therapy clinic management, built with Next.js 15, Prisma, and NextAuth.js v5.

## Local Setup Instructions

### 1. Prerequisites
- Node.js 18.x or later
- A PostgreSQL database instance (local or hosted)

### 2. Database (Development)
The project is configured to use **SQLite** for stable local development, which requires no extra setup.

```bash
# Push schema and seed admin account
npx prisma db push
npm run db:seed
```

### 3. Environment Configuration
Copy the template:
```bash
cp .env.example .env
```
Key variables:
- `AUTH_SECRET`: Generated automatically.
- `ADMIN_EMAIL`: Set to `admin@ksaa.com`.


### 4. Run the Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

## Core Features
- **Patient Portal**: Profile management, service discovery, and 4-step booking flow.
- **Admin Dashboard**: Comprehensive clinic overview, product CRUD, and recurring schedule management.
- **Secure Payments**: Stripe integration supporting full payments or 30% deposits.
- **RBAC**: Role-based access control protecting patient and admin routes.

## Admin Access
After seeding, you can log in to the admin portal at `/admin-login` using:
- **Email**: `admin@ksaa.com` (as per `.env`)
- **Password**: `adminpassword123` (defined in `prisma/seed.js`)
