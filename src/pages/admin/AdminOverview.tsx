import { useNavigate } from "react-router-dom";
import {
  Users, GraduationCap, BookOpen, BarChart3, TrendingUp, ArrowUpRight,
  AlertTriangle, Clock, Activity, CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "../../hooks/useAuthStore";
import SessionBadge from "../../components/SessionBadge";
import {
  Line, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area,
} from "recharts";
import {
  getStats, getAttendanceTrend, getCourseAttendance,
  getLowAttendanceStudents, mockAttendance,
} from "../../lib/mockData";

export default function AdminOverview() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const stats = getStats();
  const trend = getAttendanceTrend(14);
  const courseAtt = getCourseAttendance();
  const lowAttendance = getLowAttendanceStudents();
  const recentActivity = mockAttendance.slice(0, 7);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1.5 text-sm">Here's what's happening across your institution today.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-sm text-gray-300">
          <Clock className="h-4 w-4 text-indigo-400" />
          {today}
        </div>
      </div>

      {/* Session info card */}
      <SessionBadge variant="card" />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          label="Total Students"
          value={stats.totalStudents}
          delta="+12% this month"
          deltaPositive
          icon={<Users className="h-5 w-5" />}
          gradient="from-violet-500 to-purple-600"
        />
        <KPI
          label="Faculty Members"
          value={stats.totalFaculty}
          delta="Active staff"
          icon={<GraduationCap className="h-5 w-5" />}
          gradient="from-cyan-500 to-blue-600"
        />
        <KPI
          label="Avg Attendance"
          value={`${stats.avgAttendance}%`}
          delta={stats.avgAttendance >= 75 ? "Above target" : "Below target"}
          deltaPositive={stats.avgAttendance >= 75}
          icon={<BarChart3 className="h-5 w-5" />}
          gradient="from-emerald-500 to-teal-600"
        />
        <KPI
          label="Active Courses"
          value={stats.totalCourses}
          delta={`${stats.totalSubjects} subjects`}
          icon={<BookOpen className="h-5 w-5" />}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "View Analytics", desc: "Detailed insights", path: "/admin/analytics", icon: TrendingUp, gradient: "from-blue-500 to-cyan-500" },
          { label: "Manage Users", desc: "Add or edit users", path: "/admin/users", icon: Users, gradient: "from-purple-500 to-pink-500" },
          { label: `${stats.lowAttendanceStudents} Alerts`, desc: "Below 75% attendance", path: "/admin/alerts", icon: AlertTriangle, gradient: "from-amber-500 to-red-500" },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="group flex items-center gap-4 rounded-2xl glass border border-white/10 p-4 hover:border-white/20 hover:scale-[1.02] hover:bg-white/[0.04] transition-all text-left"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{action.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend */}
        <div className="lg:col-span-2 glass rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-white">Attendance Trends</h3>
              <p className="text-xs text-gray-500 mt-0.5">Last 14 days · % breakdown</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Present
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Absent
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Late
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} stroke="#374151" />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} stroke="#374151" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 15, 25, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Area type="monotone" dataKey="Present" stroke="#10b981" strokeWidth={2} fill="url(#presentGrad)" />
              <Area type="monotone" dataKey="Absent" stroke="#ef4444" strokeWidth={2} fill="url(#absentGrad)" />
              <Line type="monotone" dataKey="Late" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance distribution */}
        <div className="glass rounded-2xl border border-white/10 p-6">
          <h3 className="text-base font-semibold text-white mb-1">Quick Stats</h3>
          <p className="text-xs text-gray-500 mb-5">Last 30 days</p>

          <div className="space-y-4">
            <StatBar label="Present" value={stats.presentCount} total={stats.totalRecords} color="bg-emerald-500" />
            <StatBar label="Absent" value={stats.absentCount} total={stats.totalRecords} color="bg-red-500" />
            <StatBar label="Late" value={stats.lateCount} total={stats.totalRecords} color="bg-amber-500" />
          </div>

          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Pending Leaves</span>
              <span className="text-lg font-bold text-amber-400">{stats.pendingLeaves}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Active Students</span>
              <span className="text-lg font-bold text-emerald-400">{stats.activeStudents}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course-wise + Low Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course chart */}
        <div className="glass rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-white">Course-wise Attendance</h3>
              <p className="text-xs text-gray-500 mt-0.5">Average % per course</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={courseAtt} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} stroke="#374151" />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} stroke="#374151" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 15, 25, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="Attendance" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low attendance alerts */}
        <div className="glass rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Attendance Alerts
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Students below 75% threshold</p>
            </div>
            <span className="rounded-full bg-red-500/10 border border-red-500/20 text-red-300 px-3 py-1 text-xs font-bold">
              {lowAttendance.length}
            </span>
          </div>
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {lowAttendance.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">All students above 75%</p>
              </div>
            ) : (
              lowAttendance.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                  <div className={`w-1 h-10 rounded-full ${s.attendance_pct < 50 ? "bg-red-500" : s.attendance_pct < 65 ? "bg-amber-500" : "bg-orange-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{s.name}</p>
                    <p className="text-xs text-gray-500 truncate">{s.roll_no} · {s.course_code}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${s.attendance_pct < 50 ? "text-red-400" : "text-amber-400"}`}>
                      {s.attendance_pct}%
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Recent Activity</h3>
          </div>
          <button onClick={() => navigate("/admin/attendance")} className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
            View all →
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {recentActivity.map((r) => {
            const statusColors: Record<string, string> = {
              present: "bg-emerald-500", absent: "bg-red-500", late: "bg-amber-500", leave: "bg-purple-500", holiday: "bg-blue-500",
            };
            return (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColors[r.status]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    <span className="font-medium">{r.student_name}</span>
                    <span className="text-gray-500"> marked </span>
                    <span className={`capitalize font-medium ${
                      r.status === "present" ? "text-emerald-400" : r.status === "absent" ? "text-red-400" : "text-amber-400"
                    }`}>{r.status}</span>
                    <span className="text-gray-500"> in </span>
                    <span className="font-medium">{r.subject_name}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.course_name} · {r.roll_no}</p>
                </div>
                <span className="text-xs text-gray-500">{r.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Sub Components ─────────────────────────────────────
function KPI({ label, value, delta, deltaPositive, icon, gradient }: any) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-all hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </span>
        {delta && (
          <span className={`text-xs font-medium ${deltaPositive ? "text-emerald-400" : "text-gray-500"}`}>
            {delta}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function StatBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs text-white font-semibold">{value} <span className="text-gray-500">({pct}%)</span></span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
