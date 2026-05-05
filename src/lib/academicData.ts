/**
 * Academic structure for Jagran Lakecity University.
 *
 * Mapping (auto-derived from program — never selected manually):
 *   BTech       → JSEN (Core Engineering)
 *   BTech AIML  → JSAI (AI Program)
 *   BCA / MCA   → JSCA (future extension)
 */

import { mockStudents } from "./mockData";

// ─── Types ──────────────────────────────────────────────
export type Program = "BTech" | "BTech AIML";
export type Year = "FY" | "SY" | "TY" | "IV";
export type Section = "A" | "B";
export type School = "JSEN" | "JSAI" | "JSCA";

export interface FacultyClass {
  id: string;
  faculty_email: string;
  program: Program;
  year: Year;
  section: Section;
  school: School;
  subject_code: string;
  subject_name: string;
}

export interface ClassStudent {
  id: string;
  name: string;
  roll_no: string;
}

// ─── Auto-mapping rules ─────────────────────────────────
export const PROGRAM_TO_SCHOOL: Record<Program, School> = {
  "BTech": "JSEN",
  "BTech AIML": "JSAI",
};

export const YEAR_OPTIONS: { value: Year; label: string; semester: number }[] = [
  { value: "FY", label: "FY (1st Year)", semester: 1 },
  { value: "SY", label: "SY (2nd Year)", semester: 2 },
  { value: "TY", label: "TY (3rd Year)", semester: 3 },
  { value: "IV", label: "IV (4th Year)", semester: 4 },
];

export const PROGRAM_OPTIONS: { value: Program; label: string; school: School }[] = [
  { value: "BTech", label: "BTech (Core Engineering)", school: "JSEN" },
  { value: "BTech AIML", label: "BTech AIML (AI Program)", school: "JSAI" },
];

export const SECTION_OPTIONS: Section[] = ["A", "B"];

// ─── Helpers ────────────────────────────────────────────
export function getSchoolForProgram(program: Program): School {
  return PROGRAM_TO_SCHOOL[program];
}

export function getYearLabel(year: Year): string {
  return YEAR_OPTIONS.find((y) => y.value === year)?.label || year;
}

// ─── Faculty class assignments ──────────────────────────
// Each faculty teaches across multiple programs/years.
// We map their existing 5 subjects to specific (program, year, section) slots.
const FACULTY_CLASS_MAP: Record<string, Array<{ subject_code: string; subject_name: string; program: Program; year: Year; section: Section }>> = {
  // Dr. Rajesh Kumar — Computer Science (teaches both BTech & BTech AIML)
  "rajesh@faculty.in": [
    { subject_code: "CS201", subject_name: "Data Structures", program: "BTech", year: "SY", section: "A" },
    { subject_code: "CS301", subject_name: "Algorithms", program: "BTech", year: "TY", section: "A" },
    { subject_code: "CS302", subject_name: "Database Systems", program: "BTech AIML", year: "SY", section: "A" },
    { subject_code: "CS401", subject_name: "Operating Systems", program: "BTech", year: "IV", section: "B" },
    { subject_code: "CS402", subject_name: "Computer Networks", program: "BTech AIML", year: "TY", section: "A" },
  ],
  // Dr. Priya Singh — Mathematics (across all programs)
  "priya@faculty.in": [
    { subject_code: "MA201", subject_name: "Calculus I", program: "BTech", year: "FY", section: "A" },
    { subject_code: "MA202", subject_name: "Calculus II", program: "BTech", year: "FY", section: "B" },
    { subject_code: "MA301", subject_name: "Linear Algebra", program: "BTech AIML", year: "FY", section: "A" },
    { subject_code: "MA302", subject_name: "Probability & Statistics", program: "BTech AIML", year: "SY", section: "A" },
    { subject_code: "MA401", subject_name: "Discrete Mathematics", program: "BTech", year: "SY", section: "A" },
  ],
  // Dr. Anita Verma — Physics
  "anita@faculty.in": [
    { subject_code: "PH201", subject_name: "Classical Mechanics", program: "BTech", year: "FY", section: "A" },
    { subject_code: "PH202", subject_name: "Thermodynamics", program: "BTech", year: "FY", section: "B" },
    { subject_code: "PH301", subject_name: "Electromagnetism", program: "BTech AIML", year: "FY", section: "A" },
    { subject_code: "PH302", subject_name: "Quantum Physics", program: "BTech", year: "SY", section: "B" },
    { subject_code: "PH401", subject_name: "Modern Physics", program: "BTech AIML", year: "SY", section: "A" },
  ],
  // Prof. Suresh Reddy — Electronics
  "suresh@faculty.in": [
    { subject_code: "EC201", subject_name: "Digital Electronics", program: "BTech", year: "FY", section: "A" },
    { subject_code: "EC202", subject_name: "Analog Circuits", program: "BTech", year: "SY", section: "A" },
    { subject_code: "EC301", subject_name: "Microprocessors", program: "BTech", year: "SY", section: "B" },
    { subject_code: "EC302", subject_name: "Embedded Systems", program: "BTech AIML", year: "TY", section: "A" },
    { subject_code: "EC401", subject_name: "VLSI Design", program: "BTech", year: "IV", section: "A" },
  ],
};

// ─── Build all faculty classes ──────────────────────────
export function getFacultyClasses(facultyEmail: string): FacultyClass[] {
  const list = FACULTY_CLASS_MAP[facultyEmail.toLowerCase()];
  if (!list) {
    // For unknown faculty (any other @faculty.in email), give them a default set
    return [
      { id: `cls_${facultyEmail}_1`, faculty_email: facultyEmail, program: "BTech", year: "FY", section: "A", school: "JSEN", subject_code: "GEN101", subject_name: "General Subject 1" },
      { id: `cls_${facultyEmail}_2`, faculty_email: facultyEmail, program: "BTech", year: "SY", section: "A", school: "JSEN", subject_code: "GEN201", subject_name: "General Subject 2" },
      { id: `cls_${facultyEmail}_3`, faculty_email: facultyEmail, program: "BTech AIML", year: "FY", section: "A", school: "JSAI", subject_code: "GEN102", subject_name: "AI Foundations" },
      { id: `cls_${facultyEmail}_4`, faculty_email: facultyEmail, program: "BTech AIML", year: "SY", section: "A", school: "JSAI", subject_code: "GEN202", subject_name: "Machine Learning Basics" },
    ];
  }
  return list.map((c, i) => ({
    id: `cls_${facultyEmail}_${i}`,
    faculty_email: facultyEmail,
    program: c.program,
    year: c.year,
    section: c.section,
    school: PROGRAM_TO_SCHOOL[c.program],
    subject_code: c.subject_code,
    subject_name: c.subject_name,
  }));
}

// ─── Get classes filtered by program + year ─────────────
export function getFacultyClassesFor(facultyEmail: string, program: Program, year: Year): FacultyClass[] {
  return getFacultyClasses(facultyEmail).filter(
    (c) => c.program === program && c.year === year
  );
}

// ─── Get unique programs faculty teaches ────────────────
export function getFacultyPrograms(facultyEmail: string): Program[] {
  const classes = getFacultyClasses(facultyEmail);
  return Array.from(new Set(classes.map((c) => c.program)));
}

// ─── Get unique years faculty teaches in a program ──────
export function getFacultyYears(facultyEmail: string, program: Program): Year[] {
  const classes = getFacultyClasses(facultyEmail);
  return Array.from(new Set(classes.filter((c) => c.program === program).map((c) => c.year)));
}

// ─── Get students for a specific class ──────────────────
// In production, this would come from the DB. For demo, we return a deterministic
// subset of mockStudents based on (program + year + section).
export function getStudentsForClass(program: Program, year: Year, section: Section): ClassStudent[] {
  const yearNum = YEAR_OPTIONS.findIndex((y) => y.value === year) + 1;
  const seed = `${program}-${year}-${section}`;

  // Deterministic shuffle: pick 12-18 students based on seed
  const startIdx = (seed.charCodeAt(0) + seed.charCodeAt(seed.length - 1)) % 20;
  const count = 12 + ((seed.length * yearNum) % 7);

  return mockStudents
    .slice(startIdx, startIdx + count)
    .map((s, i) => ({
      id: s.id,
      // Make roll number reflect the program/year/section
      roll_no: `${program === "BTech AIML" ? "AIML" : "BTC"}${year}${section}${String(i + 1).padStart(3, "0")}`,
      name: s.name,
    }));
}

// ─── Last selected class persistence ────────────────────
const LAST_CLASS_KEY = "ams_last_class";

export interface LastClass {
  program: Program;
  year: Year;
  section: Section;
  classId: string;
}

export function saveLastClass(data: LastClass): void {
  try {
    localStorage.setItem(LAST_CLASS_KEY, JSON.stringify(data));
  } catch {}
}

export function getLastClass(): LastClass | null {
  try {
    const raw = localStorage.getItem(LAST_CLASS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
