# AMS REST API Documentation

**Base URL:** `/api/v1`
**Auth:** JWT Bearer Token via `Authorization: Bearer <token>` header

## Standard Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable message",
  "meta": { "page": 1, "limit": 20, "total": 145, "totalPages": 8 }
}
```

### Error
```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": [ ... ]
}
```

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Request body/query failed Zod validation |
| `BAD_REQUEST` | 400 | Generic bad request |
| `INVALID_JSON` | 400 | Malformed JSON body |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `TOKEN_EXPIRED` | 401 | JWT expired |
| `INVALID_TOKEN` | 401 | JWT signature invalid |
| `FORBIDDEN` | 403 | User lacks required role |
| `NOT_FOUND` | 404 | Resource not found |
| `ROUTE_NOT_FOUND` | 404 | Endpoint does not exist |
| `CONFLICT` | 409 | Resource conflict (e.g. duplicate) |
| `DUPLICATE_ENTRY` | 409 | DB unique constraint violation |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

---

## 1. AUTH MODULE — `/auth`

### POST `/auth/login` — Login
**Body:**
```json
{ "email": "rajesh@faculty.in", "password": "password123" }
```
**Validation:**
- `email`: must end with `@admin.in`, `@faculty.in`, or `@jlu.edu.in`
- `password`: min 1 character

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "uuid", "name": "Dr. Rajesh Kumar",
      "email": "rajesh@faculty.in", "role": "faculty",
      "department": "Computer Science"
    }
  }
}
```

### GET `/auth/me` — Get current user
**Headers:** `Authorization: Bearer <token>`

---

## 2. ATTENDANCE MODULE — `/attendance`

### POST `/attendance/mark` — Mark attendance (bulk)
**Auth:** Faculty / Admin
**Body:**
```json
{
  "subject_id": "uuid",
  "date": "2026-03-15",
  "records": [
    { "student_id": "uuid-1", "status": "present" },
    { "student_id": "uuid-2", "status": "absent" }
  ],
  "remarks": "Optional"
}
```
**Status values:** `present`, `absent`, `late`, `leave`, `holiday`
**48-hour edit window** enforced — older records are locked.

### GET `/attendance` — List attendance records
**Auth:** Admin / Faculty
**Query:** `student_id`, `subject_id`, `course_id`, `status`, `date_from`, `date_to`, `page`, `limit`

### GET `/attendance/my` — Student's own records
**Auth:** Student
**Query:** `subject_id`, `page`, `limit`

### GET `/attendance/summary` — Per-subject % for current student
**Auth:** Student

### GET `/attendance/mark-data?subject_id=&date=` — Marking UI data
**Auth:** Faculty / Admin
Returns student list + lock status for each existing record.

### GET `/attendance/:id` — Single record with editability check

---

## 3. STUDENTS MODULE — `/students`

### GET `/students` — List students
**Auth:** Admin / Faculty
**Query:** `course_id`, `semester`, `page`, `limit`

### GET `/students/:id` — Get one student
**Auth:** Admin / Faculty

### POST `/students` — Create student profile
**Auth:** Admin
**Body:**
```json
{
  "user_id": "uuid",
  "course_id": "uuid",
  "roll_no": "CS2024001",
  "semester": 3,
  "batch_year": 2024
}
```

### PUT `/students/:id` — Update student
**Auth:** Admin

### DELETE `/students/:id` — Delete student
**Auth:** Admin

---

## 4. FACULTY MODULE — `/faculty`

### GET `/faculty` — List faculty
**Auth:** Admin / Faculty
**Query:** `department`

### GET `/faculty/:id` — Get one faculty
**Auth:** Admin / Faculty

### POST `/faculty` — Create faculty profile
**Auth:** Admin
**Body:**
```json
{
  "user_id": "uuid",
  "department": "Computer Science",
  "qualification": "Ph.D."
}
```

### PUT `/faculty/:id` — Update faculty
**Auth:** Admin

### DELETE `/faculty/:id` — Delete faculty
**Auth:** Admin

---

## 5. REPORTS MODULE — `/reports`

### GET `/reports/dashboard` — Dashboard stats (single endpoint)
**Auth:** Admin / Faculty
**Response:**
```json
{
  "success": true,
  "data": {
    "counts": { "students": 48, "faculty": 4, "courses": 4, "subjects": 20 },
    "attendance": {
      "total_records": 5400, "present_records": 4200,
      "avg_percentage": 78, "period": { "from": "...", "to": "..." }
    },
    "alerts": { "pending_leaves": 3, "low_attendance_students": 8 },
    "generated_at": "2026-03-15T..."
  }
}
```

### GET `/reports/attendance` — Attendance report
**Auth:** Admin / Faculty
**Query:** `date_from`, `date_to`, `subject_id`, `course_id`, `student_id`, `faculty_id`, `status`, `format=json|summary`, `page`, `limit`

`format=summary` returns aggregated counts only:
```json
{
  "total": 1245, "present": 980, "absent": 180, "late": 70,
  "leave": 12, "holiday": 3, "attendance_percentage": 79
}
```

### GET `/reports/students` — Per-student stats
**Auth:** Admin / Faculty
**Query:** `student_id`, `course_id`, `semester`, `threshold`
Returns each student with `attendance_percentage`, `present_count`, `absent_count`, `late_count`, `total_classes`.

### GET `/reports/faculty` — Faculty workload
**Auth:** Admin
**Query:** `faculty_id`, `department`
Returns subject_count, total_classes_marked, avg_attendance per faculty.

### GET `/reports/courses` — Course-wise summary
**Auth:** Admin / Faculty

### GET `/reports/trends` — Time-series attendance trend
**Auth:** Admin / Faculty
**Query:** `period=daily|weekly|monthly`, `date_from`, `date_to`, `course_id`, `subject_id`
**Response:**
```json
{
  "success": true,
  "data": {
    "period": "weekly",
    "date_from": "...", "date_to": "...",
    "points": [
      { "period": "2026-03-01", "total": 240, "present": 198, "absent": 30, "late": 12, "attendance_percentage": 82.5 },
      ...
    ]
  }
}
```

### GET `/reports/low-attendance` — Students below threshold
**Auth:** Admin / Faculty
**Query:** `threshold=75`, `course_id`, `semester`
Returns students with `attendance_percentage < threshold` (min 5 classes).
Each entry includes `severity`: `critical` (<50%), `warning` (<65%), `notice` (<75%).

### GET `/reports/export?type=` — Raw data for client-side export
**Auth:** Admin / Faculty
**Query:** `type=attendance|students|subjects|faculty`

---

## 6. OTHER MODULES (existing)

| Endpoint | Module |
|----------|--------|
| `/users` | User management (Admin only for CRUD) |
| `/courses` | Academic courses |
| `/subjects` | Subjects (auto-mapped to faculty) |
| `/leaves` | Leave applications |

---

## Authentication Flow

1. POST `/auth/login` with `{ email, password }`
2. Receive `{ token, user }` in response
3. Include `Authorization: Bearer <token>` in all subsequent requests
4. Token expires per `JWT_EXPIRES_IN` (default `8h`)

## Role-Based Access (RBAC)

| Module | Admin | Faculty | Student |
|--------|:-----:|:-------:|:-------:|
| Auth (own) | ✅ | ✅ | ✅ |
| Users CRUD | ✅ | – | – |
| Students CRUD | ✅ | View | – |
| Faculty CRUD | ✅ | View | – |
| Courses CRUD | ✅ | View | View |
| Subjects CRUD | ✅ | View | View |
| Mark Attendance | ✅ | ✅ | – |
| View All Attendance | ✅ | ✅ | Own only |
| Approve Leaves | ✅ | ✅ | – |
| Reports | ✅ | ✅ (most) | – |

## Pagination

All list endpoints support:
- `page` (default `1`)
- `limit` (default `20`, max `100`)

Response includes:
```json
"meta": { "page": 1, "limit": 20, "total": 145, "totalPages": 8 }
```

## Validation

All write operations use **Zod schemas**. Failed validation returns:
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    { "path": "email", "message": "Invalid email address" },
    { "path": "password", "message": "Password must be at least 6 characters" }
  ]
}
```
