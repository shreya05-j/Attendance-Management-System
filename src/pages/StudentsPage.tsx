import { useState, useEffect } from "react";
import { Plus, Search, Loader2, UserPlus, GraduationCap } from "lucide-react";
import { api } from "../lib/api";
import Modal from "../components/ui/Modal";
import Select from "../components/ui/Select";

interface Student {
  id: string;
  name: string;
  email: string;
  roll_no: string;
  course_name: string;
  course_id: string;
  semester: number;
  attendance_pct: number;
  is_active: boolean;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newStudent, setNewStudent] = useState({ 
    name: "", 
    email: "", 
    roll_no: "", 
    course_id: "", 
    semester: 1,
    password: "password123" // Default password for new students
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, coursesRes] = await Promise.all([
        api.get<Student[]>("/students?limit=100"),
        api.get<Course[]>("/courses")
      ]);

      if (studentsRes.success) setStudentsList(studentsRes.data);
      if (coursesRes.success) {
        setCourses(coursesRes.data);
        if (coursesRes.data.length > 0 && !newStudent.course_id) {
          setNewStudent(prev => ({ ...prev, course_id: coursesRes.data[0].id }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email || !newStudent.roll_no || !newStudent.course_id) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 1. Create User
      const userResponse = await api.post("/users", {
        name: newStudent.name,
        email: newStudent.email,
        password: newStudent.password,
        role: "student"
      });

      if (userResponse.success) {
        const userId = userResponse.data.id;
        
        // 2. Create Student Profile
        const studentResponse = await api.post("/students", {
          user_id: userId,
          course_id: newStudent.course_id,
          roll_no: newStudent.roll_no,
          semester: newStudent.semester,
          batch_year: new Date().getFullYear()
        });

        if (studentResponse.success) {
          setIsModalOpen(false);
          setNewStudent({ 
            name: "", 
            email: "", 
            roll_no: "", 
            course_id: courses[0]?.id || "", 
            semester: 1,
            password: "password123"
          });
          fetchData(); // Refresh list
        }
      }
    } catch (error) {
      console.error("Failed to add student:", error);
      alert(error instanceof Error ? error.message : "Failed to add student");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const filtered = studentsList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_no.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Students
            </h1>
            <p className="text-gray-400 mt-1.5 text-sm">Manage student profiles and enrollment.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
            <Plus className="h-4 w-4" /> Add Student
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-xl glass border border-white/10 px-3 py-2 max-w-md">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none flex-1"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
            <p className="text-gray-500 text-sm">Loading students...</p>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">All Students ({filtered.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll No</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sem</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-gray-500 text-sm">
                        No students found matching your search.
                      </td>
                    </tr>
                  ) : filtered.map((s) => {
                    const initials = s.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-semibold shadow-lg">
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{s.name}</p>
                              <p className="text-xs text-gray-500">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-300 font-mono">{s.roll_no}</td>
                        <td className="px-5 py-3 text-sm text-gray-300">{s.course_name}</td>
                        <td className="px-5 py-3 text-sm text-gray-400">Sem {s.semester}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${(s.attendance_pct || 0) >= 75 ? "bg-emerald-500" : (s.attendance_pct || 0) >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                                style={{ width: `${s.attendance_pct || 0}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold ${(s.attendance_pct || 0) >= 75 ? "text-emerald-400" : (s.attendance_pct || 0) >= 60 ? "text-amber-400" : "text-red-400"}`}>
                              {s.attendance_pct || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.is_active ? "text-emerald-400" : "text-gray-500"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? "bg-emerald-500" : "bg-gray-500"}`} />
                            {s.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Student">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Student Name</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input 
                  type="text" 
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  placeholder="Full Name"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Roll No</label>
              <input 
                type="text" 
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                value={newStudent.roll_no} onChange={(e) => setNewStudent({...newStudent, roll_no: e.target.value})}
                placeholder="e.g. 2021BTE001"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email Address (@jlu.edu.in)</label>
            <input 
              type="email" 
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
              value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
              placeholder="student@jlu.edu.in"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Program / Course</label>
              <Select 
                value={newStudent.course_id}
                onChange={(val) => setNewStudent({...newStudent, course_id: val})}
                options={courses.map(c => ({ value: c.id, label: c.name }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Current Semester</label>
              <Select 
                value={newStudent.semester.toString()}
                onChange={(val) => setNewStudent({...newStudent, semester: parseInt(val)})}
                options={[
                  { value: "1", label: "Semester 1" },
                  { value: "2", label: "Semester 2" },
                  { value: "3", label: "Semester 3" },
                  { value: "4", label: "Semester 4" },
                  { value: "5", label: "Semester 5" },
                  { value: "6", label: "Semester 6" },
                  { value: "7", label: "Semester 7" },
                  { value: "8", label: "Semester 8" },
                ]}
              />
            </div>
          </div>
          <div className="pt-4 flex items-center justify-end gap-3">
            <button 
              onClick={() => setIsModalOpen(false)} 
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white disabled:opacity-50">
              Cancel
            </button>
            <button 
              onClick={handleAddStudent}
              disabled={isSubmitting || !newStudent.name || !newStudent.email || !newStudent.roll_no}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-emerald-500 rounded-xl text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {isSubmitting ? "Enrolling..." : "Enroll Student"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

