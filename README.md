# Attendance Management System

A production-ready attendance management system built with React, Node.js, Express, and PostgreSQL.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Auth**: JWT + bcrypt

## Project Structure

```
├── index.html              # HTML entry
├── src/                    # Frontend source
│   ├── App.tsx             # Root component with routing
│   ├── main.tsx            # Entry point
│   ├── index.css           # Tailwind CSS
│   ├── lib/                # Shared libraries
│   │   ├── api.ts          # API client
│   │   ├── store.ts        # Auth store
│   │   └── format.ts       # Formatting helpers
│   ├── components/         # UI components
│   │   ├── Layout.tsx      # App layout with sidebar
│   │   ├── DataTable.tsx   # Reusable data table
│   │   ├── StatCard.tsx    # Statistics card
│   │   └── ProtectedRoute.tsx
│   └── pages/              # Page components
│       ├── Login.tsx
│       ├── Dashboard.tsx
│       ├── AttendancePage.tsx
│       ├── LeavesPage.tsx
│       └── UsersPage.tsx
├── server/                 # Backend source
│   ├── .env                # Environment variables
│   ├── src/
│   │   ├── index.ts        # Express server entry
│   │   ├── config/         # Config (env, database)
│   │   ├── database/       # Migrations and seeds
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── controllers/    # Route handlers
│   │   ├── routes/         # Express routes
│   │   └── schemas/        # Zod validation schemas
│   └── package.json
├── .env.example
├── package.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Frontend
cp .env.example .env

# Backend
cp server/.env server/.env  # Already has defaults, edit as needed
```

### 3. Setup Database

Create a PostgreSQL database:

```bash
createdb attendance_db
```

Run migrations:

```bash
npm run migrate
```

Seed sample data:

```bash
npm run seed
```

### 4. Start Development

```bash
# Run both frontend and backend
npm run dev:all

# Or run separately:
npm run dev        # Frontend (Vite) on :5173
npm run dev:server # Backend (Express) on :5000
```

### 5. Login

Use the seeded demo accounts (password: `password123`):

| Role    | Email                 | Domain          |
|---------|-----------------------|-----------------|
| Admin   | admin@admin.in        | @admin.in       |
| Faculty | rajesh@faculty.in     | @faculty.in     |
| Faculty | priya@faculty.in      | @faculty.in     |
| Student | arjun@jlu.edu.in      | @jlu.edu.in     |
| Student | neha@jlu.edu.in       | @jlu.edu.in     |

## API Endpoints

### Auth
- `POST /api/v1/auth/login` - Login (email domain determines role)
- `GET /api/v1/auth/me` - Get current user

### Users (Admin & Faculty can view; Admin only for create/update/delete)
- `GET /api/v1/users` - List users (Admin, Faculty)
- `GET /api/v1/users/:id` - Get user (Admin, Faculty)
- `POST /api/v1/users` - Create user (Admin only — role auto-detected from email domain)
- `PUT /api/v1/users/:id` - Update user (Admin only)
- `DELETE /api/v1/users/:id` - Delete user (Admin only)

### Courses (All authenticated users can view; Admin only for CRUD)
- `GET /api/v1/courses` - List courses with subject/student counts
- `GET /api/v1/courses/:id` - Get course details
- `GET /api/v1/courses/:id/subjects` - Get subjects for a course
- `POST /api/v1/courses` - Create course (Admin)
- `PUT /api/v1/courses/:id` - Update course (Admin)
- `DELETE /api/v1/courses/:id` - Delete course (Admin)

### Subjects (All authenticated users can view; Admin only for CRUD)
- `GET /api/v1/subjects` - List subjects (filterable by course_id, faculty_id, semester)
- `GET /api/v1/subjects/:id` - Get subject details
- `POST /api/v1/subjects` - Create subject (Admin)
- `PUT /api/v1/subjects/:id` - Update subject (Admin)
- `DELETE /api/v1/subjects/:id` - Delete subject (Admin)

### Students (Admin & Faculty can view; Admin only for CRUD)
- `GET /api/v1/students` - List students (filterable by course_id, semester)
- `GET /api/v1/students/:id` - Get student details
- `POST /api/v1/students` - Create student profile (Admin)
- `PUT /api/v1/students/:id` - Update student (Admin)
- `DELETE /api/v1/students/:id` - Delete student (Admin)

### Faculty (Admin & Faculty can view; Admin only for CRUD)
- `GET /api/v1/faculty` - List faculty (filterable by department)
- `GET /api/v1/faculty/:id` - Get faculty details
- `POST /api/v1/faculty` - Create faculty profile (Admin)
- `PUT /api/v1/faculty/:id` - Update faculty (Admin)
- `DELETE /api/v1/faculty/:id` - Delete faculty (Admin)

### Attendance (Faculty & Admin mark; All roles can view own; Admin & Faculty view all)
- `POST /api/v1/attendance/mark` - **Bulk mark attendance** (Faculty, Admin) — marks/updates records in a transaction
- `GET /api/v1/attendance/mark-data` - Get attendance data with **lock status** for the bulk marking UI (Faculty, Admin)
- `GET /api/v1/attendance/:id` - Get single attendance record with editability check
- `GET /api/v1/attendance` - All attendance records with filters & `editable` flags (Admin, Faculty)
- `GET /api/v1/attendance/my` - My attendance (Student)
- `GET /api/v1/attendance/summary` - Attendance summary per subject with percentages (Student)

> **🔒 48-Hour Edit Window**: Attendance records can only be modified within **48 hours** of creation.
> After that, records are **permanently locked**. The API returns `editable: true/false` and a
> `lock_reason` field for each record. The bulk marking UI visually locks student rows that
> cannot be edited.

### Leaves (Students request; Faculty & Admin approve/reject)
- `POST /api/v1/leaves` - Request leave (Student)
- `GET /api/v1/leaves/my` - My leaves (Student)
- `GET /api/v1/leaves` - All leaves (Admin, Faculty)
- `PUT /api/v1/leaves/:id/status` - Approve/reject leave (Admin, Faculty)

## Role-Based Access Summary

| Feature                     | Admin | Faculty | Student |
|-----------------------------|:-----:|:-------:|:-------:|
| View Dashboard              |  ✅   |   ✅    |   ✅    |
| View Courses                |  ✅   |   ✅    |   ✅    |
| View Subjects               |  ✅   |   ✅    |   ✅    |
| Create/Edit Courses         |  ✅   |   ❌    |   ❌    |
| Create/Edit Subjects        |  ✅   |   ❌    |   ❌    |
| Mark Attendance (bulk)      |  ✅   |   ✅    |   ❌    |
| View All Attendance         |  ✅   |   ✅    |   ❌    |
| View My Attendance (own)    |  ✅   |   ✅    |   ✅    |
| Attendance Summary/Stats    |  ✅   |   ✅    |   ✅    |
| Edit Attendance (48h window)|  ✅   |   ✅    |   ❌    |
| Request Leave               |  ✅   |   ✅    |   ✅    |
| View All Leaves             |  ✅   |   ✅    |   ❌    |
| Approve/Reject Leave        |  ✅   |   ✅    |   ❌    |
| View Students               |  ✅   |   ✅    |   ❌    |
| Manage Students             |  ✅   |   ❌    |   ❌    |
| View Users                  |  ✅   |   ✅    |   ❌    |
| Create/Edit/Delete Users    |  ✅   |   ❌    |   ❌    |

### Email Domain Rules

| Role    | Email Domain    |
|---------|-----------------|
| Admin   | @admin.in       |
| Faculty | @faculty.in     |
| Student | @jlu.edu.in     |

## Deployment

### Build Frontend

```bash
npm run build
```

Output: `dist/` directory with all assets inlined.

### Build Backend

```bash
npm run build:server
```

### Environment Variables for Production

Set these in your deployment environment:

**Server (`server/.env`)**:
- `NODE_ENV=production`
- `PORT=5000`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` — **use a strong random string**
- `CORS_ORIGIN` — set to your frontend URL
