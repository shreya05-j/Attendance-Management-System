# 🚀 Project Running Guide

Welcome to the **Attendance Management System (AMS)**! This guide will walk you through exactly how to set up, configure, and run the project on your local machine.

## Prerequisites

Before you start, make sure you have the following installed on your system:
1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v14 or higher)
3. **Git**

---

## Step 1: Clone and Install Dependencies

Open your terminal and navigate to the project folder (if you haven't already), then install the dependencies. Since the project shares a root `package.json` for both frontend and backend scripts, you only need to run this once:

```bash
npm install
```

## Step 2: Configure Environment Variables

The application needs environment variables to know how to connect to the backend and the database.

1. **Frontend Environment:**
   Copy the `.env.example` file to create your local `.env` file:
   ```bash
   cp .env.example .env
   ```
   *(It should contain `VITE_API_URL=http://localhost:5000/api/v1`)*

2. **Backend Environment:**
   Navigate into the `server` folder and create another `.env` file for the backend.
   ```bash
   # On Windows (PowerShell)
   Copy-Item server/.env.example server/.env
   
   # On Mac/Linux
   cp server/.env.example server/.env
   ```
   *(If you don't see a `server/.env.example`, simply create `server/.env` and add your database credentials like so:)*
   ```env
   NODE_ENV=development
   PORT=5000
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=attendance_db
   JWT_SECRET=super_secret_jwt_key_123
   CORS_ORIGIN=http://localhost:5173
   ```
   **Important:** Make sure to update `DB_PASSWORD` to your actual PostgreSQL password.

## Step 3: Setup the Database

1. **Create the Database:**
   Open your PostgreSQL tool (like pgAdmin, DBeaver, or psql command line) and create a new database named exactly as it is in your `.env` file (e.g., `attendance_db`).
   
   *Using psql:*
   ```bash
   psql -U postgres -c "CREATE DATABASE attendance_db;"
   ```

2. **Run Migrations (Create Tables):**
   This will automatically create all the necessary tables (users, students, attendance, etc.).
   ```bash
   npm run migrate
   ```

3. **Seed the Database (Add Mock Data):**
   This script will populate your database with 80 students, 4 faculty members, subjects, courses, and over 1,200 realistic attendance records so you can test the application immediately.
   ```bash
   npm run seed
   ```

## Step 4: Run the Application!

You can launch both the React frontend and the Express backend simultaneously with a single command:

```bash
npm run dev:all
```

**What happens now?**
- 🟢 **Frontend** will start at: `http://localhost:5173` (or `:5174`/`:5175` depending on port availability)
- 🟢 **Backend** will start at: `http://localhost:5000`

---

## Step 5: Test the Application

Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`). 
You can use any of the following pre-seeded demo accounts. The password for **all** accounts is `password123`.

| Role | Login Email | What you can do |
| :--- | :--- | :--- |
| **Admin** | `admin@admin.in` | Full access. View analytics, manage users, courses, and subjects. |
| **Faculty** | `rajesh@faculty.in` | Mark attendance, generate QR codes, approve leaves. |
| **Student** | `arjun.patel@jlu.edu.in` | View personal attendance, request leaves. |

---

## Troubleshooting Common Issues

**1. "Failed to fetch" or Network Error when logging in**
*   **Cause:** The frontend cannot reach the backend.
*   **Fix:** Check your terminal. Is the backend running? Ensure `VITE_API_URL` in your root `.env` matches the port the server is running on (usually `5000`). Make sure you don't have conflicting CORS settings.

**2. Database Connection Refused / Password Authentication Failed**
*   **Cause:** The credentials in `server/.env` are incorrect.
*   **Fix:** Double check `DB_USER`, `DB_PASSWORD`, and `DB_NAME`. Ensure your local PostgreSQL service is actually running.

**3. "relation 'users' does not exist"**
*   **Cause:** You forgot to run the database migrations.
*   **Fix:** Stop the server, run `npm run migrate`, then `npm run seed`, and start the server again.
