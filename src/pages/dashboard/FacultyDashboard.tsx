import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Users, CheckCircle2, Clock, UserCheck, Save, AlertTriangle,
  Calendar, TrendingUp, Activity, ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../hooks/useAuthStore";
import SessionBadge from "../../components/SessionBadge";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from "recharts";
import { mockSubjects, mockStudents, getFacultySubjects } from "../../lib/mockData";

const STATUSES = ["present", "absent", "late", "leave"] as const;
type Status = typeof STATUSES[number];

export default function FacultyDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Get subjects assigned to this faculty (5 each)
  // Match by email if it's a known faculty, otherwise show first 5 subjects
  const mySubjects = user?.email
    ? (() => {
        const fromEmail = getFacultySubjects(user.email);
        return fromEmail.length > 0 ? fromEmail : mockSubjects.slice(0, 5);
      })()
    : mockSubjects.slice(0, 5);

  const totalStudents = mockStudents.length;
  const totalClasses = mySubjects.reduce((sum) => sum + Math.floor(Math.random() * 50) + 30, 0);
  const avgAttendance = Math.round(mySubjects.reduce((sum, s) => sum + s.attendance_pct, 0) / mySubjects.length);

  // Mark attendance state
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [markDate, setMarkDate] = useState(new Date().toISOString().split("T")[0]);
  const [studentMarks, setStudentMarks] = useState<Record<string, Status>>({});
  const [savedMessage, setSavedMessage] = useState("");

  const studentsForMarking = mockStudents.slice(0, 12);

  const cycleStatus = (id: string) => {
    setStudentMarks((prev) => {
      const current = prev[id] || "present";
      const next = STATUSES[(STATUSES.indexOf(current) + 1) % STATUSES.length];
      return { ...prev, [id]: next };
    });
  };

  const bulkMark = (status: Status) => {
    const updated: Record<string, Status> = {};
    studentsForMarking.forEach((s) => { updated[s.id] = status; });
    setStudentMarks(updated);
  };

  const saveAttendance = () => {
    setSavedMessage(`✓ Attendance saved for ${studentsForMarking.length} students on ${markDate}`);
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const frequentAbsentees = mockStudents
    .filter((s) => s.attendance_pct < 70)
    .sort((a, b) => a.attendance_pct - b.attendance_pct)
    .slice(0, 6);

  const subjectChartData = mySubjects.map((s) => ({
    name: s.code,
    Attendance: s.attendance_pct,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Faculty Dashboard
          </h1>
          <p className="text-gray-400 mt-1.5 text-sm">
            Welcome, <span className="text-cyan-400 font-medium">{user?.name?.split(" ")[0]}</span> — manage your classes and track attendance.
          </p>
        </div>
        <SessionBadge variant="full" />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Assigned Subjects" value={mySubjects.length} icon={<BookOpen className="h-5 w-5" />} gradient="from-cyan-500 to-blue-600" />
        <KPI label="Students Managed" value={totalStudents} icon={<Users className="h-5 w-5" />} gradient="from-violet-500 to-purple-600" />
        <KPI label="Total Classes" value={totalClasses} icon={<Clock className="h-5 w-5" />} gradient="from-emerald-500 to-teal-600" delta={`+${Math.floor(totalClasses * 0.1)} this week`} deltaPositive />
        <KPI label="Avg Attendance" value={`${avgAttendance}%`} icon={<CheckCircle2 className="h-5 w-5" />} gradient="from-amber-500 to-orange-600" delta={avgAttendance >= 75 ? "Above target" : "Below target"} deltaPositive={avgAttendance >= 75} />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Subjects List */}
        <div className="lg:col-span-2 glass rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-cyan-400" /> Your Subjects
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Click to mark attendance</p>
            </div>
          </div>
          <div className="space-y-2">
            {mySubjects.map((sub) => {
              const isSelected = selectedSubject === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-400/30"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{sub.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{sub.code} · Sem {sub.semester} · {sub.course_name}</p>
                    </div>
                    <span className={`text-sm font-bold ml-2 ${sub.attendance_pct >= 75 ? "text-emerald-400" : "text-amber-400"}`}>
                      {sub.attendance_pct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${sub.attendance_pct >= 75 ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}
                      style={{ width: `${sub.attendance_pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mark Attendance CTA */}
        <div className="lg:col-span-3 glass rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg mb-4">
            <UserCheck className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Mark Attendance</h3>
          <p className="text-sm text-gray-400 mb-5 max-w-sm">
            Select a subject, choose the date, and mark your students as present or absent. Records are saved to the database.
          </p>
          <button
            onClick={() => navigate("/faculty/mark-attendance")}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
          >
            <UserCheck className="h-4 w-4" />
            Open Mark Attendance
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject chart */}
        <div className="lg:col-span-2 glass rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" /> Subject Performance
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Attendance % across your subjects</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={subjectChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} stroke="#374151" />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} stroke="#374151" />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
              />
              <Bar dataKey="Attendance" radius={[8, 8, 0, 0]}>
                {subjectChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.Attendance >= 75 ? "#10b981" : entry.Attendance >= 60 ? "#f59e0b" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Frequent absentees */}
        <div className="glass rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" /> Frequent Absentees
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Need attention</p>
            </div>
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 px-3 py-1 text-xs font-bold">
              {frequentAbsentees.length}
            </span>
          </div>
          <div className="space-y-2">
            {frequentAbsentees.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{s.name}</p>
                  <p className="text-xs text-gray-500 truncate">{s.roll_no}</p>
                </div>
                <span className="text-sm font-bold text-amber-400 ml-2">{s.attendance_pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" /> Recent Marking History
          </h3>
          <span className="text-xs text-gray-500">Last 30 days · 48h edit window</span>
        </div>
        <div className="divide-y divide-white/5">
          {[
            { subject: "Data Structures", date: "Today", count: 12, present: 10, locked: false },
            { subject: "Algorithms", date: "Yesterday", count: 15, present: 13, locked: false },
            { subject: "Database Systems", date: "2 days ago", count: 18, present: 15, locked: false },
            { subject: "Operating Systems", date: "3 days ago", count: 14, present: 12, locked: true },
            { subject: "Computer Networks", date: "5 days ago", count: 16, present: 14, locked: true },
          ].map((h, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{h.subject}</p>
                  <p className="text-xs text-gray-500">{h.date} · {h.present}/{h.count} present</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${h.locked ? "text-gray-500" : "text-emerald-400"}`}>
                  {h.locked ? "🔒 Locked" : "Editable"}
                </span>
                {!h.locked && <ChevronRight className="h-4 w-4 text-gray-600" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, delta, deltaPositive, icon, gradient }: any) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-5 hover:border-white/20 hover:scale-[1.02] transition-all">
      <div className="flex items-start justify-between mb-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </span>
        {delta && (
          <span className={`text-xs font-medium ${deltaPositive ? "text-emerald-400" : "text-gray-500"}`}>{delta}</span>
        )}
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function BulkBtn({ label, onClick, color }: any) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/20",
    red: "bg-red-500/10 text-red-300 hover:bg-red-500/20 border-red-500/20",
    amber: "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border-amber-500/20",
  };
  return (
    <button onClick={onClick} className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${colors[color]}`}>
      {label}
    </button>
  );
}
