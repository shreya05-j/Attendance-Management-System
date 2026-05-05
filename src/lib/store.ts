import { useState, useEffect } from "react";
import { api } from "./api";

export type UserRole = "admin" | "faculty" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  // Student fields
  profile_id?: string;
  roll_no?: string;
  semester?: number;
  course_id?: string;
  course_name?: string;
  course_code?: string;
  // Faculty fields
  department?: string;
  qualification?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  duration_years: number;
  is_active: boolean;
  subject_count?: number;
  student_count?: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  course_id: string;
  course_name?: string;
  course_code?: string;
  faculty_id: string | null;
  faculty_name?: string;
  faculty_department?: string;
  semester: number;
  credits: number;
  is_active: boolean;
}

export interface Student {
  id: string;
  user_id: string;
  name: string;
  email: string;
  roll_no: string;
  course_id: string;
  course_name: string;
  course_code: string;
  semester: number;
  batch_year: number;
  is_active: boolean;
}

export interface Faculty {
  id: string;
  user_id: string;
  name: string;
  email: string;
  department: string;
  qualification: string;
  is_active: boolean;
  subject_count?: number;
}

export interface Attendance {
  id: string;
  student_id: string;
  subject_id: string;
  date: string;
  status: "present" | "absent" | "late" | "leave" | "holiday";
  remarks: string;
  subject_name?: string;
  subject_code?: string;
  student_name?: string;
  student_email?: string;
  roll_no?: string;
  semester?: number;
  course_name?: string;
  marked_by_name?: string;
}

export interface AttendanceRecord {
  student_id: string;
  status: "present" | "absent" | "late" | "leave" | "holiday";
}

export interface Leave {
  id: string;
  student_id: string;
  leave_type: "sick" | "casual" | "annual" | "other";
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  student_name?: string;
  student_email?: string;
  roll_no?: string;
  course_name?: string;
  approved_by_name?: string | null;
}

export interface AttendanceSummary {
  overall: { total: number; present: number; absent: number; late: number };
  subjects: Array<{
    id: string;
    name: string;
    code: string;
    total: number;
    present: number;
    absent: number;
    late: number;
    leave_count: number;
    holiday: number;
  }>;
}

// ─── Auth State ─────────────────────────────────────────
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

let authState: AuthState = {
  user: null,
  token: api.getToken(),
  loading: false,
  error: null,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function getAuthState(): AuthState {
  return authState;
}

export async function login(email: string, password: string) {
  authState = { ...authState, loading: true, error: null };
  notify();

  try {
    const res = await api.post<{ token: string; user: User }>("/auth/login", {
      email,
      password,
    });
    api.setToken(res.data.token);
    authState = {
      user: res.data.user,
      token: res.data.token,
      loading: false,
      error: null,
    };
    notify();
    return res.data;
  } catch (err: any) {
    authState = { ...authState, loading: false, error: err.message };
    notify();
    throw err;
  }
}

export async function fetchMe() {
  try {
    const res = await api.get<User>("/auth/me");
    authState = { ...authState, user: res.data, loading: false, error: null };
    notify();
  } catch {
    authState = { user: null, token: null, loading: false, error: null };
    api.setToken(null);
    notify();
  }
}

export function logout() {
  api.setToken(null);
  authState = { user: null, token: null, loading: false, error: null };
  notify();
}

export function useAuth() {
  const [state, setState] = useState(authState);

  useEffect(() => {
    const unsub = subscribe(() => setState({ ...authState }));
    return () => { unsub(); };
  }, []);

  return state;
}

// ─── Role-based helpers ─────────────────────────────────
export function isAdmin(user: User | null): boolean {
  return user?.role === "admin";
}

export function isFaculty(user: User | null): boolean {
  return user?.role === "faculty";
}

export function isStudent(user: User | null): boolean {
  return user?.role === "student";
}

export function canManageUsers(user: User | null): boolean {
  return user?.role === "admin";
}

export function canViewAllAttendance(user: User | null): boolean {
  return user?.role === "admin" || user?.role === "faculty";
}

export function canApproveLeaves(user: User | null): boolean {
  return user?.role === "admin" || user?.role === "faculty";
}

export function canMarkAttendance(user: User | null): boolean {
  return user?.role === "admin" || user?.role === "faculty";
}
