import { useState, useEffect } from "react";
import { Plus, BookOpen, Loader2, BookmarkPlus } from "lucide-react";
import { api } from "../lib/api";
import Modal from "../components/ui/Modal";
import Select from "../components/ui/Select";

interface Subject {
  id: string;
  name: string;
  code: string;
  course_name: string;
  course_id: string;
  faculty_name: string;
  faculty_id: string;
  semester: number;
  credits: number;
  attendance_pct: number;
}

interface Course {
  id: string;
  name: string;
}

interface Faculty {
  id: string;
  name: string;
}

export default function SubjectsPage() {
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newSubject, setNewSubject] = useState({ 
    name: "", 
    code: "", 
    course_id: "", 
    faculty_id: "",
    semester: 1, 
    credits: 4 
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjectsRes, coursesRes, facultyRes] = await Promise.all([
        api.get<Subject[]>("/subjects"),
        api.get<Course[]>("/courses"),
        api.get<Faculty[]>("/faculty")
      ]);

      if (subjectsRes.success) setSubjectsList(subjectsRes.data);
      if (coursesRes.success) setCourses(coursesRes.data);
      if (facultyRes.success) setFacultyList(facultyRes.data);

      // Set defaults if data available
      if (coursesRes.success && coursesRes.data.length > 0 && !newSubject.course_id) {
        setNewSubject(prev => ({ ...prev, course_id: coursesRes.data[0].id }));
      }
      if (facultyRes.success && facultyRes.data.length > 0 && !newSubject.faculty_id) {
        setNewSubject(prev => ({ ...prev, faculty_id: facultyRes.data[0].id }));
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

  const handleAddSubject = async () => {
    if (!newSubject.name || !newSubject.code || !newSubject.course_id || !newSubject.faculty_id) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post("/subjects", newSubject);
      if (response.success) {
        setIsModalOpen(false);
        setNewSubject({ 
          name: "", 
          code: "", 
          course_id: courses[0]?.id || "", 
          faculty_id: facultyList[0]?.id || "",
          semester: 1, 
          credits: 4 
        });
        fetchData(); // Refresh list
      }
    } catch (error) {
      console.error("Failed to add subject:", error);
      alert(error instanceof Error ? error.message : "Failed to add subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Subjects
            </h1>
            <p className="text-gray-400 mt-1.5 text-sm">View and manage subjects across all courses.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
            <Plus className="h-4 w-4" /> Add Subject
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
            <p className="text-gray-500 text-sm">Loading subjects...</p>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-base font-semibold text-white">All Subjects ({subjectsList.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Faculty</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sem</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Credits</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {subjectsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-gray-500 text-sm">
                        No subjects found. Add one to get started.
                      </td>
                    </tr>
                  ) : subjectsList.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <p className="text-sm font-medium text-white">{s.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-2 py-0.5">
                          {s.code}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-300">{s.course_name}</td>
                      <td className="px-5 py-3 text-sm text-gray-300">{s.faculty_name || "Unassigned"}</td>
                      <td className="px-5 py-3 text-sm text-gray-400">Sem {s.semester}</td>
                      <td className="px-5 py-3 text-sm text-gray-300">{s.credits}</td>
                      <td className="px-5 py-3">
                        <span className={`text-sm font-bold ${(s.attendance_pct || 0) >= 75 ? "text-emerald-400" : (s.attendance_pct || 0) >= 60 ? "text-amber-400" : "text-red-400"}`}>
                          {s.attendance_pct || 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Subject">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Subject Name</label>
            <input 
              type="text" 
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
              value={newSubject.name} onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
              placeholder="e.g. Data Structures & Algorithms"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Subject Code</label>
              <input 
                type="text" 
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                value={newSubject.code} onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                placeholder="e.g. CS-301"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Credits</label>
              <input 
                type="number" 
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                value={newSubject.credits} onChange={(e) => setNewSubject({...newSubject, credits: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Semester</label>
              <Select 
                value={newSubject.semester.toString()}
                onChange={(val) => setNewSubject({...newSubject, semester: parseInt(val)})}
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
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Course / Program</label>
              <Select 
                value={newSubject.course_id}
                onChange={(val) => setNewSubject({...newSubject, course_id: val})}
                options={courses.map(c => ({ value: c.id, label: c.name }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Assign Faculty</label>
            <Select 
              value={newSubject.faculty_id}
              onChange={(val) => setNewSubject({...newSubject, faculty_id: val})}
              options={facultyList.map(f => ({ value: f.id, label: f.name }))}
            />
          </div>
          <div className="pt-4 flex items-center justify-end gap-3">
            <button 
              onClick={() => setIsModalOpen(false)} 
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white disabled:opacity-50">
              Cancel
            </button>
            <button 
              onClick={handleAddSubject}
              disabled={isSubmitting || !newSubject.name || !newSubject.code || !newSubject.course_id}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-cyan-500 rounded-xl text-white hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkPlus className="h-4 w-4" />}
              {isSubmitting ? "Saving..." : "Add Subject"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

