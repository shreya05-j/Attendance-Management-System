/**
 * Academic session management for Jagran Lakecity University.
 *
 * Calendar:
 *   ODD SEMESTER  → July to December   (Sem 1, 3, 5, 7)
 *   EVEN SEMESTER → January to May     (Sem 2, 4, 6, 8)
 *   Summer Break  → June only
 *
 * Year (FY/SY/TY/IV) maps to TWO semesters depending on the active session:
 *   FY → Sem 1 (Odd) or Sem 2 (Even)
 *   SY → Sem 3 (Odd) or Sem 4 (Even)
 *   TY → Sem 5 (Odd) or Sem 6 (Even)
 *   IV → Sem 7 (Odd) or Sem 8 (Even)
 */

export type SessionType = "odd" | "even" | "break";
export type Year = "FY" | "SY" | "TY" | "IV";

export interface SessionInfo {
  type: SessionType;
  label: string;
  shortLabel: string;
  monthsLabel: string;
  startMonth: number; // 0-indexed
  endMonth: number;   // 0-indexed
  academicYear: string; // e.g. "2025-26"
  isActive: boolean;
}

// ─── Detect current session ──────────────────────────────
export function getCurrentSession(date: Date = new Date()): SessionInfo {
  const month = date.getMonth(); // 0 = Jan
  const year = date.getFullYear();

  // ODD: July (6) – December (11)
  if (month >= 6 && month <= 11) {
    return {
      type: "odd",
      label: "Odd Semester",
      shortLabel: "Odd Sem",
      monthsLabel: "July – December",
      startMonth: 6,
      endMonth: 11,
      academicYear: `${year}-${String(year + 1).slice(-2)}`,
      isActive: true,
    };
  }

  // EVEN: January (0) – May (4)
  if (month >= 0 && month <= 4) {
    return {
      type: "even",
      label: "Even Semester",
      shortLabel: "Even Sem",
      monthsLabel: "January – May",
      startMonth: 0,
      endMonth: 4,
      academicYear: `${year - 1}-${String(year).slice(-2)}`,
      isActive: true,
    };
  }

  // BREAK: June only
  return {
    type: "break",
    label: "Summer Break",
    shortLabel: "Break",
    monthsLabel: "June",
    startMonth: 5,
    endMonth: 5,
    academicYear: `${year - 1}-${String(year).slice(-2)}`,
    isActive: false,
  };
}

// ─── Semester ↔ Session helpers ──────────────────────────
export function getSessionForSemester(semester: number): "odd" | "even" {
  return semester % 2 === 1 ? "odd" : "even";
}

export function isSemesterInCurrentSession(semester: number, date: Date = new Date()): boolean {
  const current = getCurrentSession(date);
  if (current.type === "break") return false;
  return getSessionForSemester(semester) === current.type;
}

// ─── Year (FY/SY/TY/IV) → Semester resolver ─────────────
// Given a "year" tier (FY/SY/TY/IV) and the current session,
// return the actual semester number.
export function resolveSemester(year: Year, session: SessionType = getCurrentSession().type): number {
  const baseMap: Record<Year, number> = {
    FY: 1, // semester 1 (odd)
    SY: 3, // semester 3 (odd)
    TY: 5, // semester 5 (odd)
    IV: 7, // semester 7 (odd)
  };

  const odd = baseMap[year];
  // Even session bumps by 1 (e.g. FY/Even = sem 2, SY/Even = sem 4, etc.)
  return session === "even" ? odd + 1 : odd;
}

// ─── Get the next session ────────────────────────────────
export function getNextSession(date: Date = new Date()): SessionInfo {
  const current = getCurrentSession(date);
  const year = date.getFullYear();

  if (current.type === "odd") {
    // Next is Even (Jan-May of next year)
    return {
      type: "even",
      label: "Even Semester",
      shortLabel: "Even Sem",
      monthsLabel: "January – May",
      startMonth: 0,
      endMonth: 4,
      academicYear: `${year}-${String(year + 1).slice(-2)}`,
      isActive: false,
    };
  }
  if (current.type === "even") {
    // Next is Odd (July-Dec of same year)
    return {
      type: "odd",
      label: "Odd Semester",
      shortLabel: "Odd Sem",
      monthsLabel: "July – December",
      startMonth: 6,
      endMonth: 11,
      academicYear: `${year}-${String(year + 1).slice(-2)}`,
      isActive: false,
    };
  }
  // Break → Odd
  return {
    type: "odd",
    label: "Odd Semester",
    shortLabel: "Odd Sem",
    monthsLabel: "July – December",
    startMonth: 6,
    endMonth: 11,
    academicYear: `${year}-${String(year + 1).slice(-2)}`,
    isActive: false,
  };
}

// ─── Days remaining in current session ───────────────────
export function getSessionProgress(date: Date = new Date()): {
  daysElapsed: number;
  totalDays: number;
  percentComplete: number;
  daysRemaining: number;
} {
  const current = getCurrentSession(date);
  const year = date.getFullYear();

  let startDate: Date;
  let endDate: Date;

  if (current.type === "odd") {
    startDate = new Date(year, 6, 1);     // July 1
    endDate = new Date(year, 11, 31);     // Dec 31
  } else if (current.type === "even") {
    startDate = new Date(year, 0, 1);     // Jan 1
    endDate = new Date(year, 4, 31);      // May 31
  } else {
    startDate = new Date(year, 5, 1);
    endDate = new Date(year, 5, 30);
  }

  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);
  const daysElapsed = Math.max(0, Math.ceil((date.getTime() - startDate.getTime()) / 86400000));
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const percentComplete = Math.min(100, Math.round((daysElapsed / totalDays) * 100));

  return { daysElapsed, totalDays, daysRemaining, percentComplete };
}

// ─── All session option (for dropdowns) ──────────────────
export const SESSION_OPTIONS = [
  { value: "current", label: "Current Session", description: "Auto-detected" },
  { value: "odd", label: "Odd Semester", description: "July – December" },
  { value: "even", label: "Even Semester", description: "January – May" },
];

// ─── Format helpers ──────────────────────────────────────
export function getSessionBadgeClass(type: SessionType): string {
  switch (type) {
    case "odd":
      return "bg-amber-500/10 text-amber-300 border-amber-500/30";
    case "even":
      return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
    case "break":
      return "bg-gray-500/10 text-gray-400 border-gray-500/30";
  }
}

export function getSessionGradient(type: SessionType): string {
  switch (type) {
    case "odd":  return "from-amber-500 to-orange-600";
    case "even": return "from-cyan-500 to-blue-600";
    case "break": return "from-gray-500 to-slate-600";
  }
}
