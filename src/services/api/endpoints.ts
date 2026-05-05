import { apiClient } from "./client";


// ─── Types ──────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "faculty" | "student";
  is_active: boolean;
  created_at: string;
  profile_id?: string;
  roll_no?: string;
  semester?: number;
  course_id?: string;
  course_name?: string;
  course_code?: string;
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
  roll_no?: string;
  semester?: number;
  course_name?: string;
  marked_by_name?: string;
  editable?: boolean;
  lock_reason?: string | null;
}

export interface Leave {
  id: string;
  student_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  student_name?: string;
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

export interface MarkDataResponse {
  subject: { id: string; name: string; code: string };
  date: string;
  is_locked: boolean;
  lock_reason: string | null;
  records: Array<{
    student_id: string;
    roll_no: string;
    name: string;
    semester: number;
    status: string;
    remarks: string;
    locked: boolean;
    lock_reason: string;
    is_existing: boolean;
  }>;
}

// ─── API Functions ──────────────────────────────────────

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: User }>("/auth/login", { email, password }),
  me: () => apiClient.get<User>("/auth/me"),
};

// Users
export const usersApi = {
  list: (params?: string) => apiClient.get<User[]>(`/users${params ? `?${params}` : ""}`),
  getById: (id: string) => apiClient.get<User>(`/users/${id}`),
  create: (data: { name: string; email: string; password: string }) =>
    apiClient.post<User>("/users", data),
  update: (id: string, data: any) => apiClient.put<User>(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

// Courses
export const coursesApi = {
  list: () => apiClient.get<Course[]>("/courses"),
  getById: (id: string) => apiClient.get<Course>(`/courses/${id}`),
  getSubjects: (id: string) => apiClient.get<any[]>(`/courses/${id}/subjects`),
  create: (data: any) => apiClient.post<Course>("/courses", data),
  update: (id: string, data: any) => apiClient.put<Course>(`/courses/${id}`, data),
  delete: (id: string) => apiClient.delete(`/courses/${id}`),
};

// Subjects
export const subjectsApi = {
  list: (params?: string) => apiClient.get<Subject[]>(`/subjects${params ? `?${params}` : ""}`),
  getById: (id: string) => apiClient.get<Subject>(`/subjects/${id}`),
  create: (data: any) => apiClient.post<Subject>("/subjects", data),
  update: (id: string, data: any) => apiClient.put<Subject>(`/subjects/${id}`, data),
  delete: (id: string) => apiClient.delete(`/subjects/${id}`),
};

// Students
export const studentsApi = {
  list: (params?: string) => apiClient.get<Student[]>(`/students${params ? `?${params}` : ""}`),
  getById: (id: string) => apiClient.get<Student>(`/students/${id}`),
  create: (data: any) => apiClient.post<Student>("/students", data),
  update: (id: string, data: any) => apiClient.put<Student>(`/students/${id}`, data),
  delete: (id: string) => apiClient.delete(`/students/${id}`),
};

// Faculty
export const facultyApi = {
  list: (params?: string) => apiClient.get<Faculty[]>(`/faculty${params ? `?${params}` : ""}`),
  getById: (id: string) => apiClient.get<Faculty>(`/faculty/${id}`),
  create: (data: any) => apiClient.post<Faculty>("/faculty", data),
  update: (id: string, data: any) => apiClient.put<Faculty>(`/faculty/${id}`, data),
  delete: (id: string) => apiClient.delete(`/faculty/${id}`),
};

// Attendance
export const attendanceApi = {
  mark: (data: any) => apiClient.post<any>("/attendance/mark", data),
  markData: (subjectId: string, date: string) =>
    apiClient.get<MarkDataResponse>(`/attendance/mark-data?subject_id=${subjectId}&date=${date}`),
  getById: (id: string) => apiClient.get<Attendance>(`/attendance/${id}`),
  list: (params: string) => apiClient.get<Attendance[]>(`/attendance?${params}`),
  myAttendance: (params: string) => apiClient.get<Attendance[]>(`/attendance/my?${params}`),
  summary: () => apiClient.get<AttendanceSummary>("/attendance/summary"),
};

// Leaves
export const leavesApi = {
  list: (params: string) => apiClient.get<Leave[]>(`/leaves?${params}`),
  myLeaves: (params: string) => apiClient.get<Leave[]>(`/leaves/my?${params}`),
  request: (data: any) => apiClient.post<Leave>("/leaves", data),
  updateStatus: (id: string, status: string) =>
    apiClient.put<Leave>(`/leaves/${id}/status`, { status }),
};
