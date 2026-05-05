import bcrypt from "bcryptjs";
import pool from "../config/database.js";

// ─── 80 Unique Indian Student Names (20 per course) ─────
// Organized by course to ensure no duplicates across classes

interface StudentDef {
  name: string;
  email: string;
  courseCode: string;
  rollNo: string;
  semester: number;
  batchYear: number;
}

// B.Tech Computer Science — 20 students
const CS_STUDENTS: Omit<StudentDef, "courseCode" | "semester" | "batchYear">[] = [
  { name: "Arjun Patel",         email: "arjun.patel@jlu.edu.in" },
  { name: "Neha Gupta",          email: "neha.gupta@jlu.edu.in" },
  { name: "Kavita Das",          email: "kavita.das@jlu.edu.in" },
  { name: "Ravi Mehta",          email: "ravi.mehta@jlu.edu.in" },
  { name: "Sneha Sharma",        email: "sneha.sharma@jlu.edu.in" },
  { name: "Vikram Rathore",      email: "vikram.rathore@jlu.edu.in" },
  { name: "Priyanka Tiwari",     email: "priyanka.tiwari@jlu.edu.in" },
  { name: "Mohit Agarwal",       email: "mohit.agarwal@jlu.edu.in" },
  { name: "Deepika Nair",        email: "deepika.nair@jlu.edu.in" },
  { name: "Ankit Chauhan",       email: "ankit.chauhan@jlu.edu.in" },
  { name: "Pooja Mishra",        email: "pooja.mishra@jlu.edu.in" },
  { name: "Rahul Pandey",        email: "rahul.pandey@jlu.edu.in" },
  { name: "Swati Jain",          email: "swati.jain@jlu.edu.in" },
  { name: "Aakash Verma",        email: "aakash.verma@jlu.edu.in" },
  { name: "Ritika Saxena",       email: "ritika.saxena@jlu.edu.in" },
  { name: "Kunal Deshmukh",      email: "kunal.deshmukh@jlu.edu.in" },
  { name: "Megha Chopra",        email: "megha.chopra@jlu.edu.in" },
  { name: "Vivek Thakur",        email: "vivek.thakur@jlu.edu.in" },
  { name: "Nidhi Bhatia",        email: "nidhi.bhatia@jlu.edu.in" },
  { name: "Saurabh Singh",       email: "saurabh.singh@jlu.edu.in" },
];

// B.Tech Electronics — 20 students
const EC_STUDENTS: Omit<StudentDef, "courseCode" | "semester" | "batchYear">[] = [
  { name: "Amit Yadav",          email: "amit.yadav@jlu.edu.in" },
  { name: "Tanvi Kulkarni",      email: "tanvi.kulkarni@jlu.edu.in" },
  { name: "Harsh Malhotra",      email: "harsh.malhotra@jlu.edu.in" },
  { name: "Divya Srivastava",    email: "divya.srivastava@jlu.edu.in" },
  { name: "Manish Dubey",        email: "manish.dubey@jlu.edu.in" },
  { name: "Shruti Kapoor",       email: "shruti.kapoor@jlu.edu.in" },
  { name: "Nikhil Rawat",        email: "nikhil.rawat@jlu.edu.in" },
  { name: "Aarti Bhardwaj",      email: "aarti.bhardwaj@jlu.edu.in" },
  { name: "Gaurav Khatri",       email: "gaurav.khatri@jlu.edu.in" },
  { name: "Sakshi Pillai",       email: "sakshi.pillai@jlu.edu.in" },
  { name: "Pankaj Solanki",      email: "pankaj.solanki@jlu.edu.in" },
  { name: "Anjali Menon",        email: "anjali.menon@jlu.edu.in" },
  { name: "Tarun Sethi",         email: "tarun.sethi@jlu.edu.in" },
  { name: "Komal Deshpande",     email: "komal.deshpande@jlu.edu.in" },
  { name: "Ajay Patil",          email: "ajay.patil@jlu.edu.in" },
  { name: "Meera Iyer",          email: "meera.iyer@jlu.edu.in" },
  { name: "Rohit Joshi",         email: "rohit.joshi@jlu.edu.in" },
  { name: "Pallavi Shukla",      email: "pallavi.shukla@jlu.edu.in" },
  { name: "Yash Goyal",          email: "yash.goyal@jlu.edu.in" },
  { name: "Simran Kaur",         email: "simran.kaur@jlu.edu.in" },
];

// B.Sc Mathematics — 20 students
const MA_STUDENTS: Omit<StudentDef, "courseCode" | "semester" | "batchYear">[] = [
  { name: "Rohit Soni",          email: "rohit.soni@jlu.edu.in" },
  { name: "Shalini Tripathi",    email: "shalini.tripathi@jlu.edu.in" },
  { name: "Abhishek Rajput",     email: "abhishek.rajput@jlu.edu.in" },
  { name: "Prerna Choudhary",    email: "prerna.choudhary@jlu.edu.in" },
  { name: "Karan Bajaj",         email: "karan.bajaj@jlu.edu.in" },
  { name: "Ishita Ghosh",        email: "ishita.ghosh@jlu.edu.in" },
  { name: "Varun Bansal",        email: "varun.bansal@jlu.edu.in" },
  { name: "Rashmi Tyagi",        email: "rashmi.tyagi@jlu.edu.in" },
  { name: "Sunil Narayan",       email: "sunil.narayan@jlu.edu.in" },
  { name: "Nikita Bose",         email: "nikita.bose@jlu.edu.in" },
  { name: "Tushar Dwivedi",      email: "tushar.dwivedi@jlu.edu.in" },
  { name: "Garima Chahal",       email: "garima.chahal@jlu.edu.in" },
  { name: "Hemant Kashyap",      email: "hemant.kashyap@jlu.edu.in" },
  { name: "Aditi Mathur",        email: "aditi.mathur@jlu.edu.in" },
  { name: "Manoj Ranjan",        email: "manoj.ranjan@jlu.edu.in" },
  { name: "Kavya Reddy",         email: "kavya.reddy@jlu.edu.in" },
  { name: "Dhruv Khanna",        email: "dhruv.khanna@jlu.edu.in" },
  { name: "Ritu Chaudhary",      email: "ritu.chaudhary@jlu.edu.in" },
  { name: "Lokesh Tomar",        email: "lokesh.tomar@jlu.edu.in" },
  { name: "Sunita Prasad",       email: "sunita.prasad@jlu.edu.in" },
];

// B.Sc Physics — 20 students
const PH_STUDENTS: Omit<StudentDef, "courseCode" | "semester" | "batchYear">[] = [
  { name: "Sonam Kapoor",        email: "sonam.kapoor@jlu.edu.in" },
  { name: "Alok Sinha",          email: "alok.sinha@jlu.edu.in" },
  { name: "Bhavna Tandon",       email: "bhavna.tandon@jlu.edu.in" },
  { name: "Chirag Mehra",        email: "chirag.mehra@jlu.edu.in" },
  { name: "Dolly Parmar",        email: "dolly.parmar@jlu.edu.in" },
  { name: "Eshan Luthra",        email: "eshan.luthra@jlu.edu.in" },
  { name: "Falak Ansari",        email: "falak.ansari@jlu.edu.in" },
  { name: "Gaurika Bhatt",       email: "gaurika.bhatt@jlu.edu.in" },
  { name: "Hitesh Oberoi",       email: "hitesh.oberoi@jlu.edu.in" },
  { name: "Isha Vohra",          email: "isha.vohra@jlu.edu.in" },
  { name: "Jayesh Mane",         email: "jayesh.mane@jlu.edu.in" },
  { name: "Kriti Arora",         email: "kriti.arora@jlu.edu.in" },
  { name: "Lakshay Gill",        email: "lakshay.gill@jlu.edu.in" },
  { name: "Manavi Sood",         email: "manavi.sood@jlu.edu.in" },
  { name: "Naman Jha",           email: "naman.jha@jlu.edu.in" },
  { name: "Ojasvi Rastogi",      email: "ojasvi.rastogi@jlu.edu.in" },
  { name: "Pranav Shetty",       email: "pranav.shetty@jlu.edu.in" },
  { name: "Roshni Chatterjee",   email: "roshni.chatterjee@jlu.edu.in" },
  { name: "Sahil Grover",        email: "sahil.grover@jlu.edu.in" },
  { name: "Tanya Mukherjee",     email: "tanya.mukherjee@jlu.edu.in" },
];

// Build full student definitions grouped by course
function buildStudentDefs(
  students: Omit<StudentDef, "courseCode" | "semester" | "batchYear">[],
  courseCode: string,
  rollPrefix: string,
  semester: number,
  batchYear: number,
): StudentDef[] {
  return students.map((s, i) => ({
    ...s,
    courseCode,
    rollNo: `${rollPrefix}${batchYear}${String(i + 1).padStart(3, "0")}`,
    semester,
    batchYear,
  }));
}

async function seed(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log("[SEED] Seeding database...\n");

    const pwd = await bcrypt.hash("password123", 12);

    // ─────────────────── USERS ───────────────────────
    // Admin + 4 Faculty
    await client.query(`
      INSERT INTO users (name, email, role, password_hash) VALUES
        ('Vikram Sharma',  'admin@admin.in',   'admin',   $1),
        ('Rajesh Kumar',   'rajesh@faculty.in', 'faculty', $1),
        ('Priya Singh',    'priya@faculty.in',  'faculty', $1),
        ('Anita Verma',    'anita@faculty.in',  'faculty', $1),
        ('Suresh Reddy',   'suresh@faculty.in', 'faculty', $1)
      ON CONFLICT (email) DO NOTHING
    `, [pwd]);

    // 80 Student users (all unique emails)
    const allStudentDefs: StudentDef[] = [
      ...buildStudentDefs(CS_STUDENTS, "CS101", "CS", 3, 2024),
      ...buildStudentDefs(EC_STUDENTS, "EC101", "EC", 2, 2024),
      ...buildStudentDefs(MA_STUDENTS, "MA101", "MA", 2, 2024),
      ...buildStudentDefs(PH_STUDENTS, "PH101", "PH", 2, 2024),
    ];

    // Insert student users in batches
    for (const s of allStudentDefs) {
      await client.query(
        `INSERT INTO users (name, email, role, password_hash)
         VALUES ($1, $2, 'student', $3)
         ON CONFLICT (email) DO NOTHING`,
        [s.name, s.email, pwd]
      );
    }

    // Fetch all users
    const allUsersRes = await client.query("SELECT id, email, role FROM users");
    const userMap: Record<string, string> = {};
    for (const u of allUsersRes.rows) userMap[u.email] = u.id;
    console.log(`  ✓ ${allUsersRes.rows.length} users processed (1 admin + 4 faculty + ${allStudentDefs.length} students)`);

    // ─────────────────── COURSES ─────────────────────
    await client.query(`
      INSERT INTO courses (name, code, description, duration_years) VALUES
        ('B.Tech Computer Science', 'CS101', 'Bachelor of Technology in Computer Science', 4),
        ('B.Tech Electronics',      'EC101', 'Bachelor of Technology in Electronics',       4),
        ('B.Sc Mathematics',        'MA101', 'Bachelor of Science in Mathematics',           3),
        ('B.Sc Physics',            'PH101', 'Bachelor of Science in Physics',               3)
      ON CONFLICT (code) DO NOTHING
    `);

    const coursesRes = await client.query("SELECT id, name, code FROM courses");
    const courseMap: Record<string, string> = {};
    for (const c of coursesRes.rows) courseMap[c.code] = c.id;
    console.log(`  ✓ ${coursesRes.rows.length} courses processed`);

    // ─────────────────── FACULTY ─────────────────────
    await client.query(`
      INSERT INTO faculty (user_id, department, qualification) VALUES
        ($1, 'Computer Science', 'Ph.D. Computer Science'),
        ($2, 'Mathematics',      'Ph.D. Mathematics'),
        ($3, 'Physics',          'Ph.D. Physics'),
        ($4, 'Electronics',      'M.Tech Electronics')
      ON CONFLICT (user_id) DO NOTHING
    `, [
      userMap["rajesh@faculty.in"],
      userMap["priya@faculty.in"],
      userMap["anita@faculty.in"],
      userMap["suresh@faculty.in"],
    ]);

    const allFacultyRes = await client.query("SELECT id, user_id FROM faculty");
    const facultyByUser: Record<string, string> = {};
    for (const f of allFacultyRes.rows) facultyByUser[f.user_id] = f.id;
    console.log(`  ✓ ${allFacultyRes.rows.length} faculty profiles processed`);

    // ─────────────────── SUBJECTS ────────────────────
    const subjectsData = [
      // CS department (faculty: Rajesh)
      { name: "Data Structures",          code: "CS201", courseCode: "CS101", facultyEmail: "rajesh@faculty.in", semester: 2, credits: 4 },
      { name: "Algorithms",               code: "CS301", courseCode: "CS101", facultyEmail: "rajesh@faculty.in", semester: 3, credits: 4 },
      { name: "Database Systems",         code: "CS302", courseCode: "CS101", facultyEmail: "rajesh@faculty.in", semester: 3, credits: 3 },
      { name: "Operating Systems",        code: "CS401", courseCode: "CS101", facultyEmail: "rajesh@faculty.in", semester: 4, credits: 3 },
      { name: "Computer Networks",        code: "CS402", courseCode: "CS101", facultyEmail: "rajesh@faculty.in", semester: 4, credits: 3 },
      // Maths (faculty: Priya)
      { name: "Calculus I",               code: "MA201", courseCode: "MA101", facultyEmail: "priya@faculty.in",  semester: 1, credits: 4 },
      { name: "Linear Algebra",           code: "MA301", courseCode: "MA101", facultyEmail: "priya@faculty.in",  semester: 2, credits: 4 },
      { name: "Probability & Statistics", code: "MA302", courseCode: "MA101", facultyEmail: "priya@faculty.in",  semester: 3, credits: 3 },
      // Physics (faculty: Anita)
      { name: "Classical Mechanics",      code: "PH201", courseCode: "PH101", facultyEmail: "anita@faculty.in",  semester: 1, credits: 4 },
      { name: "Electromagnetism",         code: "PH301", courseCode: "PH101", facultyEmail: "anita@faculty.in",  semester: 2, credits: 4 },
      { name: "Quantum Physics",          code: "PH401", courseCode: "PH101", facultyEmail: "anita@faculty.in",  semester: 3, credits: 3 },
      // Electronics (faculty: Suresh)
      { name: "Digital Electronics",      code: "EC201", courseCode: "EC101", facultyEmail: "suresh@faculty.in", semester: 1, credits: 4 },
      { name: "Microprocessors",          code: "EC301", courseCode: "EC101", facultyEmail: "suresh@faculty.in", semester: 2, credits: 3 },
      { name: "Embedded Systems",         code: "EC401", courseCode: "EC101", facultyEmail: "suresh@faculty.in", semester: 3, credits: 3 },
    ];

    const subjectMap: Record<string, string> = {};
    for (const sub of subjectsData) {
      const facId = facultyByUser[userMap[sub.facultyEmail]];
      await client.query(
        `INSERT INTO subjects (name, code, course_id, faculty_id, semester, credits)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (code) DO NOTHING`,
        [sub.name, sub.code, courseMap[sub.courseCode], facId, sub.semester, sub.credits]
      );
    }
    const allSubjects = await client.query("SELECT id, code FROM subjects");
    for (const s of allSubjects.rows) subjectMap[s.code] = s.id;
    console.log(`  ✓ ${allSubjects.rows.length} subjects processed`);

    // ─────────────────── STUDENTS ────────────────────
    // Insert 80 student profiles (20 per course)
    for (const s of allStudentDefs) {
      const userId = userMap[s.email];
      if (!userId) continue;
      await client.query(
        `INSERT INTO students (user_id, course_id, roll_no, semester, batch_year)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (roll_no) DO NOTHING`,
        [userId, courseMap[s.courseCode], s.rollNo, s.semester, s.batchYear]
      );
    }

    const allStudentsRes = await client.query("SELECT id, user_id FROM students");
    const studentMap: Record<string, { id: string; userId: string }> = {};
    const userIdToEmail: Record<string, string> = {};
    for (const [email, id] of Object.entries(userMap)) userIdToEmail[id] = email;
    for (const s of allStudentsRes.rows) {
      const email = userIdToEmail[s.user_id];
      if (email) studentMap[email] = { id: s.id, userId: s.user_id };
    }
    console.log(`  ✓ ${allStudentsRes.rows.length} students processed (20 per course × 4 courses)`);

    // ─────────────────── ATTENDANCE ──────────────────
    // Generate realistic attendance for ALL courses over the past 2 weeks
    const courseSubjects: Record<string, string[]> = {
      CS101: ["CS201", "CS301", "CS302"],
      EC101: ["EC201", "EC301"],
      MA101: ["MA201", "MA301"],
      PH101: ["PH201", "PH301"],
    };

    const courseFaculty: Record<string, string> = {
      CS101: "rajesh@faculty.in",
      EC101: "suresh@faculty.in",
      MA101: "priya@faculty.in",
      PH101: "anita@faculty.in",
    };

    const statuses = ["present", "present", "present", "present", "present", "absent", "late"];
    let attendanceCount = 0;
    const today = new Date();

    for (const [courseCode, subCodes] of Object.entries(courseSubjects)) {
      const facId = facultyByUser[userMap[courseFaculty[courseCode]]];
      // Get students for this course
      const courseStudents = allStudentDefs
        .filter((s) => s.courseCode === courseCode)
        .map((s) => studentMap[s.email])
        .filter(Boolean);

      for (const subCode of subCodes) {
        const subjectId = subjectMap[subCode];
        if (!subjectId) continue;

        for (const student of courseStudents) {
          // 8 weekdays of attendance
          let dayCount = 0;
          const d = new Date(today);
          d.setDate(d.getDate() - 20);

          while (dayCount < 8) {
            if (d.getDay() === 0 || d.getDay() === 6) {
              d.setDate(d.getDate() + 1);
              continue;
            }

            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const dateStr = d.toISOString().split("T")[0];

            await client.query(
              `INSERT INTO attendance (student_id, subject_id, date, status, marked_by)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (student_id, subject_id, date) DO NOTHING`,
              [student.id, subjectId, dateStr, status, facId]
            );
            attendanceCount++;
            dayCount++;
            d.setDate(d.getDate() + 1);
          }
        }
      }
    }
    console.log(`  ✓ ${attendanceCount} attendance records created`);

    // ─────────────────── LEAVES ──────────────────────
    const rajeshFacId = facultyByUser[userMap["rajesh@faculty.in"]];
    const leaveReqs = [
      { email: "arjun.patel@jlu.edu.in",    type: "sick",   start: "2026-03-10", end: "2026-03-11", reason: "Fever" },
      { email: "neha.gupta@jlu.edu.in",     type: "casual", start: "2026-03-15", end: "2026-03-15", reason: "Personal work" },
      { email: "rohit.soni@jlu.edu.in",     type: "sick",   start: "2026-03-12", end: "2026-03-14", reason: "Medical appointment" },
      { email: "sonam.kapoor@jlu.edu.in",   type: "annual", start: "2026-04-01", end: "2026-04-05", reason: "Family vacation" },
      { email: "sneha.sharma@jlu.edu.in",   type: "casual", start: "2026-04-08", end: "2026-04-08", reason: "Family function" },
      { email: "amit.yadav@jlu.edu.in",     type: "sick",   start: "2026-04-10", end: "2026-04-12", reason: "Dental surgery" },
      { email: "shalini.tripathi@jlu.edu.in", type: "casual", start: "2026-04-15", end: "2026-04-16", reason: "Sister wedding" },
      { email: "alok.sinha@jlu.edu.in",     type: "sick",   start: "2026-04-18", end: "2026-04-18", reason: "Stomach flu" },
    ];

    let leaveCount = 0;
    for (const l of leaveReqs) {
      const student = studentMap[l.email];
      if (!student) continue;
      await client.query(
        `INSERT INTO leaves (student_id, leave_type, start_date, end_date, reason, status, approved_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [student.id, l.type, l.start, l.end, l.reason, "approved", rajeshFacId]
      );
      leaveCount++;
    }
    console.log(`  ✓ ${leaveCount} leave records created`);

    // ─── OUTPUT ──────────────────────────────────────
    console.log("\n  ─── Login Credentials (Password: password123) ───");
    console.log("  Role      │ Email                        │ Password");
    console.log("  ──────────┼──────────────────────────────┼───────────");
    console.log("  Admin     │ admin@admin.in               │ password123");
    console.log("  Faculty   │ rajesh@faculty.in            │ password123");
    console.log("  Faculty   │ priya@faculty.in             │ password123");
    console.log("  Faculty   │ anita@faculty.in             │ password123");
    console.log("  Faculty   │ suresh@faculty.in            │ password123");
    console.log("  Student   │ arjun.patel@jlu.edu.in       │ password123");
    console.log("  Student   │ neha.gupta@jlu.edu.in        │ password123");
    console.log("  Student   │ (... 78 more students)       │ password123");
    console.log("");
    console.log("  ─── Students per Course ───");
    console.log("  CS101 — B.Tech Computer Science  │ 20 students  │ CS2024001 → CS2024020");
    console.log("  EC101 — B.Tech Electronics       │ 20 students  │ EC2024001 → EC2024020");
    console.log("  MA101 — B.Sc Mathematics         │ 20 students  │ MA2024001 → MA2024020");
    console.log("  PH101 — B.Sc Physics             │ 20 students  │ PH2024001 → PH2024020\n");

    console.log("[SEED] Seeding complete! 80 students across 4 courses.");
  } catch (error: any) {
    console.error("[SEED] Seeding failed:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
