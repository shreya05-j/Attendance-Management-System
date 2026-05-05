export {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  detectRole,
  validateEmailDomain as validateEmailDomainSchema,
} from "./auth.schema.js";

export {
  createStudentSchema,
  updateStudentSchema,
} from "./student.schema.js";

export {
  createFacultySchema,
  updateFacultySchema,
} from "./faculty.schema.js";

export {
  createCourseSchema,
  updateCourseSchema,
} from "./course.schema.js";

export {
  createSubjectSchema,
  updateSubjectSchema,
} from "./subject.schema.js";

export {
  markAttendanceSchema,
  attendanceQuerySchema,
} from "./attendance.schema.js";

export {
  createLeaveSchema,
  updateLeaveStatusSchema,
} from "./leave.schema.js";

export {
  attendanceReportQuerySchema,
  studentReportQuerySchema,
  facultyReportQuerySchema,
  courseReportQuerySchema,
  trendReportQuerySchema,
  lowAttendanceReportSchema,
} from "./report.schema.js";
