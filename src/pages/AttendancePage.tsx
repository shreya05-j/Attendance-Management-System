import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Lock, Loader2, Calendar } from "lucide-react";
import { api } from "../lib/api";
import { useAuthStore } from "../hooks/useAuthStore";
import Select from "../components/ui/Select";

interface AttendanceRecord {
  id: string;
  date: string;
  student_name: string;
  roll_no: string;
  subject_name: string;
  subject_code: string;
  status: "present" | "absent" | "late" | "leave" | "holiday";
  marked_by_name?: string;
  editable: boolean;
}

export default function AttendancePage() {
  const { user } = useAuthStore();
  const isStudent = user?.role === "student";

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = isStudent ? "/attendance/me" : "/attendance";
      const params: Record<string, string> = {};
      if (statusFilter !== "all") params.status = statusFilter;
      
      const query = new URLSearchParams(params).toString();
      const response = await api.get<AttendanceRecord[]>(`${endpoint}${query ? "?" + query : ""}`);
      
      if (response.success) {
        setRecords(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [isStudent, statusFilter]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const filtered = records.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.student_name?.toLowerCase().includes(s) ||
      r.subject_name.toLowerCase().includes(s) ||
      r.roll_no?.toLowerCase().includes(s) ||
      r.subject_code.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
          {isStudent ? "My Attendance" : "Attendance Records"}
        </h1>
        <p className="text-gray-400 mt-1.5 text-sm">
          {isStudent
            ? "Your personal attendance history across all subjects."
            : "View and filter all attendance entries."}
        </p>
      </div>

      {isStudent && (
        <div className="flex items-center gap-3 rounded-xl glass border border-cyan-500/20 bg-cyan-500/5 p-3 text-sm text-cyan-300">
          <Lock className="h-4 w-4 flex-shrink-0" />
          <span>You can only view your own attendance records. Other students' data is private.</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl glass border border-white/10 px-3 py-2 flex-1 max-w-md">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder={isStudent ? "Search by subject..." : "Search by student, roll no, or subject..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none flex-1"
          />
        </div>
        <div className="w-44">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            icon={<Filter className="h-4 w-4 text-gray-400" />}
            options={[
              { value: "all", label: "All Status" },
              { value: "present", label: "Present" },
              { value: "absent", label: "Absent" },
              { value: "late", label: "Late" },
              { value: "leave", label: "Leave" },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Fetching records...</p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  {!isStudent && (
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  )}
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Marked By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={isStudent ? 4 : 5} className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Calendar className="h-10 w-10 text-gray-600" />
                        <p className="text-gray-500 text-sm">No attendance records found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const colors: Record<string, string> = {
                      present: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                      absent: "text-red-400 bg-red-500/10 border-red-500/20",
                      late: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                      leave: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                      holiday: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                    };
                    return (
                      <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3 text-sm text-gray-300">
                          {new Date(r.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </td>
                        {!isStudent && (
                          <td className="px-5 py-3">
                            <p className="text-sm font-medium text-white">{r.student_name}</p>
                            <p className="text-xs text-gray-500">{r.roll_no}</p>
                          </td>
                        )}
                        <td className="px-5 py-3">
                          <p className="text-sm text-white">{r.subject_name}</p>
                          <p className="text-xs text-gray-500 font-mono">{r.subject_code}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${colors[r.status]}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-400">{r.marked_by_name || "System"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

