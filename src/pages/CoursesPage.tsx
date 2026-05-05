import { useState, useEffect } from "react";
import { Plus, BookOpen, Users, Layers, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import Modal from "../components/ui/Modal";

interface Course {
  id: string;
  name: string;
  code: string;
  duration_years: number;
  student_count: number;
  subject_count: number;
  description?: string;
}

export default function CoursesPage() {
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: "", code: "", duration_years: 4, description: "" });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get<Course[]>("/courses");
      if (response.success) {
        setCoursesList(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddCourse = async () => {
    if (!newCourse.name || !newCourse.code) return;
    
    try {
      setIsSubmitting(true);
      const response = await api.post<Course>("/courses", newCourse);
      if (response.success) {
        setCoursesList([response.data, ...coursesList]);
        setIsModalOpen(false);
        setNewCourse({ name: "", code: "", duration_years: 4, description: "" });
        // Refresh to get updated counts if any, though they'll be 0 for new course
        fetchCourses();
      }
    } catch (error) {
      console.error("Failed to add course:", error);
      alert(error instanceof Error ? error.message : "Failed to add course");
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
              Courses
            </h1>
            <p className="text-gray-400 mt-1.5 text-sm">Manage academic programs and curricula.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all">
            <Plus className="h-4 w-4" /> Add Course
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            <p className="text-gray-500 text-sm">Loading courses...</p>
          </div>
        ) : coursesList.length === 0 ? (
          <div className="glass rounded-2xl border border-white/10 p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">No courses found</h3>
            <p className="text-gray-500 mt-1">Start by adding your first academic program.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coursesList.map((c) => (
              <div key={c.id} className="glass rounded-2xl border border-white/10 p-6 hover:border-white/20 hover:scale-[1.02] transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-0.5">
                    {c.code}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white">{c.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{c.duration_years} years duration</p>

                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Users className="h-3 w-3" /> Students
                    </div>
                    <p className="text-lg font-bold text-white mt-0.5">{c.student_count || 0}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Layers className="h-3 w-3" /> Subjects
                    </div>
                    <p className="text-lg font-bold text-white mt-0.5">{c.subject_count || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Course">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Course Name</label>
            <input 
              type="text" 
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              value={newCourse.name} onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
              placeholder="e.g. Bachelor of Technology"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Course Code</label>
              <input 
                type="text" 
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                value={newCourse.code} onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                placeholder="e.g. BTECH-CS"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Duration (Years)</label>
              <input 
                type="number" 
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                value={newCourse.duration_years} onChange={(e) => setNewCourse({...newCourse, duration_years: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Description (Optional)</label>
            <textarea 
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none h-20"
              value={newCourse.description} onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
              placeholder="Brief course description..."
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
              onClick={handleAddCourse}
              disabled={isSubmitting || !newCourse.name || !newCourse.code}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-amber-500 rounded-xl text-white hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isSubmitting ? "Adding..." : "Add Course"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

