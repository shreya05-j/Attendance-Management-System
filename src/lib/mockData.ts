/**
 * Mock data layer — provides realistic demo data without requiring a backend.
 */

export interface MockStudent {
  id: string;
  name: string;
  email: string;
  roll_no: string;
  course_name: string;
  course_code: string;
  semester: number;
  batch_year: number;
  is_active: boolean;
  attendance_pct: number;
}

export interface MockFaculty {
  id: string;
  name: string;
  email: string;
  department: string;
  qualification: string;
  subjects: number;
}

export interface MockCourse {
  id: string;
  name: string;
  code: string;
  duration_years: number;
  student_count: number;
  subject_count: number;
}

export interface MockSubject {
  id: string;
  name: string;
  code: string;
  course_id: string;
  course_name: string;
  faculty_id: string;
  faculty_name: string;
  faculty_email: string;
  semester: number;
  credits: number;
  attendance_pct: number;
}

export interface MockAttendance {
  id: string;
  student_id: string;
  student_name: string;
  roll_no: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  course_name: string;
  date: string;
  status: "present" | "absent" | "late" | "leave" | "holiday";
  marked_by: string;
}

export interface MockLeave {
  id: string;
  student_name: string;
  roll_no: string;
  course_name: string;
  leave_type: "sick" | "casual" | "annual" | "other";
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

const FIRST_NAMES = ["Arjun", "Neha", "Rohit", "Priya", "Amit", "Kavita", "Ravi", "Anita", "Sonam", "Vikram", "Ishita", "Karan", "Meera", "Pooja", "Aditya", "Sneha", "Manish", "Divya", "Rahul", "Tanya"];
const LAST_NAMES = ["Patel", "Sharma", "Gupta", "Singh", "Kumar", "Verma", "Reddy", "Joshi", "Yadav", "Kapoor", "Mehta", "Shah", "Iyer", "Nair", "Das", "Rao", "Mishra", "Pandey"];

const COURSES = [
  { id: "course_cs", name: "B.Tech Computer Science", code: "CS101", duration: 4 },
  { id: "course_ec", name: "B.Tech Electronics", code: "EC101", duration: 4 },
  { id: "course_ma", name: "B.Sc Mathematics", code: "MA101", duration: 3 },
  { id: "course_ph", name: "B.Sc Physics", code: "PH101", duration: 3 },
];

// ─── Faculty with assigned subjects (5 each) ────────────
const FACULTY_DATA = [
  {
    id: "fac_rajesh",
    name: "Dr. Rajesh Kumar",
    email: "rajesh@faculty.in",
    dept: "Computer Science",
    courseId: "course_cs",
    subjects: [
      { code: "CS201", name: "Data Structures", sem: 2 },
      { code: "CS301", name: "Algorithms", sem: 3 },
      { code: "CS302", name: "Database Systems", sem: 3 },
      { code: "CS401", name: "Operating Systems", sem: 4 },
      { code: "CS402", name: "Computer Networks", sem: 4 },
    ],
  },
  {
    id: "fac_priya",
    name: "Dr. Priya Singh",
    email: "priya@faculty.in",
    dept: "Mathematics",
    courseId: "course_ma",
    subjects: [
      { code: "MA201", name: "Calculus I", sem: 1 },
      { code: "MA202", name: "Calculus II", sem: 2 },
      { code: "MA301", name: "Linear Algebra", sem: 2 },
      { code: "MA302", name: "Probability & Statistics", sem: 3 },
      { code: "MA401", name: "Discrete Mathematics", sem: 4 },
    ],
  },
  {
    id: "fac_anita",
    name: "Dr. Anita Verma",
    email: "anita@faculty.in",
    dept: "Physics",
    courseId: "course_ph",
    subjects: [
      { code: "PH201", name: "Classical Mechanics", sem: 1 },
      { code: "PH202", name: "Thermodynamics", sem: 2 },
      { code: "PH301", name: "Electromagnetism", sem: 2 },
      { code: "PH302", name: "Quantum Physics", sem: 3 },
      { code: "PH401", name: "Modern Physics", sem: 4 },
    ],
  },
  {
    id: "fac_suresh",
    name: "Prof. Suresh Reddy",
    email: "suresh@faculty.in",
    dept: "Electronics",
    courseId: "course_ec",
    subjects: [
      { code: "EC201", name: "Digital Electronics", sem: 1 },
      { code: "EC202", name: "Analog Circuits", sem: 2 },
      { code: "EC301", name: "Microprocessors", sem: 2 },
      { code: "EC302", name: "Embedded Systems", sem: 3 },
      { code: "EC401", name: "VLSI Design", sem: 4 },
    ],
  },
];

function uid(prefix = "") { return `${prefix}${Math.random().toString(36).slice(2, 11)}`; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function range(n: number): number[] { return Array.from({ length: n }, (_, i) => i); }

// ─── Generate Students ──────────────────────────────────
export const mockStudents: MockStudent[] = range(80).map((i) => {
  const first = FIRST_NAMES[i % FIRST_NAMES.length];
  const last = LAST_NAMES[(i * 3) % LAST_NAMES.length];
  const course = COURSES[i % COURSES.length];
  return {
    id: `stu_${i}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@jlu.edu.in`,
    roll_no: `${course.code.slice(0, 2)}2024${String(i + 1).padStart(3, "0")}`,
    course_name: course.name,
    course_code: course.code,
    semester: Math.floor(Math.random() * 4) + 1,
    batch_year: 2024,
    is_active: i % 16 !== 0,
    attendance_pct: Math.floor(Math.random() * 50) + 50,
  };
});

// ─── Generate Faculty ──────────────────────────────────
export const mockFaculty: MockFaculty[] = FACULTY_DATA.map((f) => ({
  id: f.id,
  name: f.name,
  email: f.email,
  department: f.dept,
  qualification: "Ph.D.",
  subjects: f.subjects.length,
}));

// ─── Generate Courses ──────────────────────────────────
export const mockCourses: MockCourse[] = COURSES.map((c) => ({
  id: c.id,
  name: c.name,
  code: c.code,
  duration_years: c.duration,
  student_count: mockStudents.filter((s) => s.course_code === c.code).length,
  subject_count: FACULTY_DATA.filter((f) => f.courseId === c.id).reduce((sum, f) => sum + f.subjects.length, 0),
}));

// ─── Generate Subjects (5 per faculty) ─────────────────
export const mockSubjects: MockSubject[] = FACULTY_DATA.flatMap((f) => {
  const course = COURSES.find((c) => c.id === f.courseId)!;
  return f.subjects.map((s) => ({
    id: `sub_${s.code.toLowerCase()}`,
    name: s.name,
    code: s.code,
    course_id: f.courseId,
    course_name: course.name,
    faculty_id: f.id,
    faculty_name: f.name,
    faculty_email: f.email,
    semester: s.sem,
    credits: 3 + (s.sem % 2),
    attendance_pct: Math.floor(Math.random() * 30) + 65,
  }));
});

// ─── Helper: Get subjects for a faculty ─────────────────
export function getFacultySubjects(facultyEmail: string): MockSubject[] {
  return mockSubjects.filter((s) => s.faculty_email === facultyEmail);
}

// ─── Generate Attendance Records (last 60 days) ────────
export const mockAttendance: MockAttendance[] = (() => {
  const records: MockAttendance[] = [];
  const today = new Date();

  // Generate for last 60 days (excluding weekends)
  for (let d = 0; d < 60; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const dateStr = date.toISOString().split("T")[0];

    // For each subject, mark attendance for relevant students
    mockSubjects.forEach((subject) => {
      // Get students from the same course
      const courseStudents = mockStudents.filter((s) => {
        const courseCodeMap: Record<string, string> = {
          course_cs: "CS101", course_ec: "EC101", course_ma: "MA101", course_ph: "PH101",
        };
        return s.course_code === courseCodeMap[subject.course_id];
      }).slice(0, 12); // limit to 12 per subject for performance

      courseStudents.forEach((student) => {
        const baseAttendance = student.attendance_pct;
        const rand = Math.random() * 100;
        let status: MockAttendance["status"];

        if (rand < baseAttendance - 15) status = "present";
        else if (rand < baseAttendance - 5) status = "late";
        else if (rand < baseAttendance + 10) status = "absent";
        else if (rand < baseAttendance + 13) status = "leave";
        else status = "holiday";

        records.push({
          id: uid("att_"),
          student_id: student.id,
          student_name: student.name,
          roll_no: student.roll_no,
          subject_id: subject.id,
          subject_name: subject.name,
          subject_code: subject.code,
          course_name: student.course_name,
          date: dateStr,
          status,
          marked_by: subject.faculty_name,
        });
      });
    });
  }
  return records;
})();

// ─── Generate Leaves ──────────────────────────────────
export const mockLeaves: MockLeave[] = range(15).map(() => {
  const stu = pick(mockStudents);
  const start = new Date(Date.now() - Math.floor(Math.random() * 25) * 86400000);
  const end = new Date(start.getTime() + Math.floor(Math.random() * 4) * 86400000);
  return {
    id: uid("lv_"),
    student_name: stu.name,
    roll_no: stu.roll_no,
    course_name: stu.course_name,
    leave_type: pick(["sick", "casual", "annual", "other"] as const),
    start_date: start.toISOString().split("T")[0],
    end_date: end.toISOString().split("T")[0],
    reason: pick(["Medical appointment", "Family function", "Personal work", "Travel", "Sick leave", "Wedding ceremony"]),
    status: pick(["pending", "approved", "rejected"] as const),
  };
});

// ─── Aggregate stats ────────────────────────────────────
export function getStats() {
  const total = mockAttendance.length;
  const present = mockAttendance.filter((r) => r.status === "present").length;
  const absent = mockAttendance.filter((r) => r.status === "absent").length;
  const late = mockAttendance.filter((r) => r.status === "late").length;

  return {
    totalStudents: mockStudents.length,
    activeStudents: mockStudents.filter((s) => s.is_active).length,
    totalFaculty: mockFaculty.length,
    totalCourses: mockCourses.length,
    totalSubjects: mockSubjects.length,
    totalRecords: total,
    avgAttendance: total > 0 ? Math.round((present / total) * 100) : 0,
    presentCount: present,
    absentCount: absent,
    lateCount: late,
    pendingLeaves: mockLeaves.filter((l) => l.status === "pending").length,
    lowAttendanceStudents: mockStudents.filter((s) => s.attendance_pct < 75).length,
  };
}

// ─── Trend builders ─────────────────────────────────────
export function getAttendanceTrend(days = 14, filterFn?: (r: MockAttendance) => boolean): any[] {
  const trend: any[] = [];
  const today = new Date();
  const records = filterFn ? mockAttendance.filter(filterFn) : mockAttendance;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayRecords = records.filter((r) => r.date === dateStr);
    const total = dayRecords.length;
    const present = dayRecords.filter((r) => r.status === "present").length;
    const absent = dayRecords.filter((r) => r.status === "absent").length;
    const late = dayRecords.filter((r) => r.status === "late").length;

    trend.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: dateStr,
      Present: total > 0 ? Math.round((present / total) * 100) : 0,
      Absent: total > 0 ? Math.round((absent / total) * 100) : 0,
      Late: total > 0 ? Math.round((late / total) * 100) : 0,
      total,
    });
  }
  return trend;
}

// ─── Weekly trend (last 8 weeks) ────────────────────────
export function getWeeklyTrend(filterFn?: (r: MockAttendance) => boolean): any[] {
  const trend: any[] = [];
  const today = new Date();
  const records = filterFn ? mockAttendance.filter(filterFn) : mockAttendance;

  for (let w = 7; w >= 0; w--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (w * 7) - 6);
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() - (w * 7));

    const weekRecords = records.filter((r) => {
      const d = new Date(r.date);
      return d >= weekStart && d <= weekEnd;
    });

    const total = weekRecords.length;
    const present = weekRecords.filter((r) => r.status === "present").length;
    const absent = weekRecords.filter((r) => r.status === "absent").length;
    const late = weekRecords.filter((r) => r.status === "late").length;

    trend.push({
      week: `W${8 - w}`,
      label: `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      Present: total > 0 ? Math.round((present / total) * 100) : 0,
      Absent: total > 0 ? Math.round((absent / total) * 100) : 0,
      Late: total > 0 ? Math.round((late / total) * 100) : 0,
      total,
    });
  }
  return trend;
}

// ─── Monthly trend (last 6 months) ──────────────────────
export function getMonthlyTrend(filterFn?: (r: MockAttendance) => boolean): any[] {
  const trend: any[] = [];
  const today = new Date();
  const records = filterFn ? mockAttendance.filter(filterFn) : mockAttendance;

  for (let m = 5; m >= 0; m--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const monthYear = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;

    const monthRecords = records.filter((r) => r.date.startsWith(monthYear));
    const total = monthRecords.length;
    const present = monthRecords.filter((r) => r.status === "present").length;

    trend.push({
      month: monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      Attendance: total > 0 ? Math.round((present / total) * 100) : Math.floor(Math.random() * 20) + 70,
      Total: total,
    });
  }
  return trend;
}

// ─── Calculate attendance % for a student in a subject ──
export function calculateAttendancePct(studentId: string, subjectId?: string): number {
  let records = mockAttendance.filter((r) => r.student_id === studentId);
  if (subjectId) records = records.filter((r) => r.subject_id === subjectId);
  if (records.length === 0) return 0;
  const present = records.filter((r) => r.status === "present").length;
  return Math.round((present / records.length) * 100);
}

// ─── Course attendance breakdown ────────────────────────
export function getCourseAttendance(): any[] {
  return mockCourses.map((c) => {
    const courseRecords = mockAttendance.filter((r) => r.course_name === c.name);
    const total = courseRecords.length;
    const present = courseRecords.filter((r) => r.status === "present").length;
    return {
      name: c.code,
      Attendance: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  });
}

// ─── Low attendance students ────────────────────────────
export function getLowAttendanceStudents(threshold = 75) {
  return mockStudents
    .filter((s) => s.attendance_pct < threshold)
    .sort((a, b) => a.attendance_pct - b.attendance_pct);
}

// ─── Subject attendance breakdown ───────────────────────
export function getSubjectAttendance(): any[] {
  return mockSubjects.map((s) => {
    const subRecords = mockAttendance.filter((r) => r.subject_id === s.id);
    const total = subRecords.length;
    const present = subRecords.filter((r) => r.status === "present").length;
    return {
      id: s.id,
      name: s.code,
      fullName: s.name,
      faculty: s.faculty_name,
      Attendance: total > 0 ? Math.round((present / total) * 100) : 0,
      Total: total,
      Present: present,
    };
  });
}
