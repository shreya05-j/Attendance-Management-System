import pool from "../config/database.js";

const migrations = [
  // ─── UUID Extension ───────────────────────────────────
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

  // ─── Users (unified auth table) ───────────────────────
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // ─── Courses ──────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL UNIQUE,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    duration_years INT NOT NULL DEFAULT 4 CHECK (duration_years > 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // ─── Faculty (extends users for role='faculty') ───────
  `CREATE TABLE IF NOT EXISTS faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(150) NOT NULL,
    qualification VARCHAR(200) DEFAULT '',
    joining_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // ─── Students (extends users for role='student') ──────
  `CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    roll_no VARCHAR(30) NOT NULL UNIQUE,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 12),
    batch_year INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // ─── Subjects (belongs to a course, taught by faculty) ─
  `CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculty(id) ON DELETE SET NULL,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 12),
    credits INT NOT NULL DEFAULT 3 CHECK (credits BETWEEN 1 AND 6),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(code),
    UNIQUE(name, course_id, semester)
  )`,

  // ─── Attendance ───────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'present'
      CHECK (status IN ('present', 'absent', 'late', 'leave', 'holiday')),
    marked_by UUID REFERENCES faculty(id) ON DELETE SET NULL,
    remarks TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, subject_id, date)
  )`,

  // ─── Leaves (replaces old leaves table) ───────────────
  `CREATE TABLE IF NOT EXISTS leaves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('sick', 'casual', 'annual', 'other')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES faculty(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
  )`,

  // ─── Indexes ──────────────────────────────────────────
  // Users
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,

  // Students
  `CREATE INDEX IF NOT EXISTS idx_students_user ON students(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_students_course ON students(course_id)`,
  `CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_no)`,
  `CREATE INDEX IF NOT EXISTS idx_students_semester ON students(semester)`,

  // Faculty
  `CREATE INDEX IF NOT EXISTS idx_faculty_user ON faculty(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty(department)`,

  // Subjects
  `CREATE INDEX IF NOT EXISTS idx_subjects_course ON subjects(course_id)`,
  `CREATE INDEX IF NOT EXISTS idx_subjects_faculty ON subjects(faculty_id)`,
  `CREATE INDEX IF NOT EXISTS idx_subjects_semester ON subjects(semester)`,

  // Attendance
  `CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date)`,
  `CREATE INDEX IF NOT EXISTS idx_attendance_subject_date ON attendance(subject_id, date)`,
  `CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)`,
  `CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status)`,

  // Leaves
  `CREATE INDEX IF NOT EXISTS idx_leaves_student ON leaves(student_id)`,
  `CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status)`,
];

async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log("[MIGRATE] Starting schema migrations...\n");

    for (const sql of migrations) {
      // Extract a readable name from SQL for logging
      const tableMatch = sql.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/);
      const indexMatch = sql.match(/CREATE INDEX.*?idx_(\w+)/);
      const label = tableMatch
        ? `Table: ${tableMatch[1]}`
        : indexMatch
          ? `Index: idx_${indexMatch[1]}`
          : `Extension`;
      console.log(`  [MIGRATE] ${label}`);
      await client.query(sql);
    }

    console.log("\n[MIGRATE] All migrations completed successfully.");
  } catch (error: any) {
    console.error("[MIGRATE] Migration failed:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
