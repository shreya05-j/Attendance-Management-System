import {
  AlertTriangle, TrendingDown, Clock, CheckCircle2, UserX, Activity,
} from "lucide-react";
import { mockStudents, mockLeaves, getStats } from "../../lib/mockData";

export default function AdminAlerts() {
  const stats = getStats();
  const lowAtt = mockStudents.filter((s) => s.attendance_pct < 75).sort((a, b) => a.attendance_pct - b.attendance_pct);
  const pendingLeaves = mockLeaves.filter((l) => l.status === "pending");
  const inactive = mockStudents.filter((s) => !s.is_active);

  const activityLog = [
    { type: "success", action: "Attendance marked", detail: "45 records for Data Structures (CS301)", time: "2 min ago" },
    { type: "info", action: "Leave approved", detail: "Arjun Patel — Sick Leave (Mar 10-11)", time: "15 min ago" },
    { type: "info", action: "New student enrolled", detail: "Priya Sharma — B.Tech CS (CS2024005)", time: "1 hour ago" },
    { type: "warning", action: "Low attendance alert", detail: `${stats.lowAttendanceStudents} students below 75%`, time: "2 hours ago" },
    { type: "success", action: "System backup", detail: "Database backup completed", time: "6 hours ago" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
          Alerts & Monitoring
        </h1>
        <p className="text-gray-400 mt-1.5 text-sm">System-wide alerts and attention items.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Below 75%"
          value={lowAtt.length}
          gradient="from-red-500 to-rose-600"
          desc="Students at risk"
        />
        <SummaryCard
          icon={<Clock className="h-5 w-5" />}
          label="Pending Leaves"
          value={pendingLeaves.length}
          gradient="from-amber-500 to-orange-600"
          desc="Awaiting approval"
        />
        <SummaryCard
          icon={<UserX className="h-5 w-5" />}
          label="Inactive Users"
          value={inactive.length}
          gradient="from-gray-500 to-slate-600"
          desc="Disabled accounts"
        />
      </div>

      {/* Low Attendance Section */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <TrendingDown className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Low Attendance Alert</h3>
              <p className="text-xs text-gray-500">Students with attendance below 75%</p>
            </div>
          </div>
          <span className="rounded-full bg-red-500/10 border border-red-500/20 text-red-300 px-3 py-1 text-xs font-bold">
            {lowAtt.length}
          </span>
        </div>
        <div className="divide-y divide-white/5">
          {lowAtt.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">All students above 75%</p>
            </div>
          ) : (
            lowAtt.slice(0, 12).map((s) => {
              const severity = s.attendance_pct < 50 ? "Critical" : s.attendance_pct < 65 ? "Warning" : "Notice";
              const sColor = s.attendance_pct < 50 ? "red" : s.attendance_pct < 65 ? "amber" : "orange";
              return (
                <div key={s.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className={`w-1.5 h-10 rounded-full bg-${sColor}-500`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{s.name}</p>
                    <p className="text-xs text-gray-500 truncate">{s.roll_no} · {s.course_name}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full bg-${sColor}-500/10 border border-${sColor}-500/20 text-${sColor}-300 px-2.5 py-0.5 text-xs font-medium`}>
                    {severity}
                  </span>
                  <span className={`text-sm font-bold text-${sColor}-400 w-12 text-right`}>{s.attendance_pct}%</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pending Leaves */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Pending Leave Requests</h3>
              <p className="text-xs text-gray-500">Awaiting approval</p>
            </div>
          </div>
          <span className="rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 px-3 py-1 text-xs font-bold">
            {pendingLeaves.length}
          </span>
        </div>
        <div className="divide-y divide-white/5">
          {pendingLeaves.map((l) => (
            <div key={l.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
              <div className="w-1.5 h-10 rounded-full bg-amber-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{l.student_name}</p>
                <p className="text-xs text-gray-500">{l.leave_type} · {l.start_date} — {l.end_date}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-1 text-xs font-medium hover:bg-emerald-500/20 transition-colors">
                  Approve
                </button>
                <button className="rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 px-3 py-1 text-xs font-medium hover:bg-red-500/20 transition-colors">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Activity */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-white/5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">System Activity Log</h3>
            <p className="text-xs text-gray-500">Recent system events</p>
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {activityLog.map((log, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
              <div className={`mt-1.5 w-2 h-2 rounded-full ${
                log.type === "success" ? "bg-emerald-500" :
                log.type === "warning" ? "bg-amber-500" : "bg-blue-500"
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{log.action}</p>
                <p className="text-xs text-gray-500 mt-0.5">{log.detail}</p>
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, gradient, desc }: any) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-all">
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">{desc}</p>
    </div>
  );
}
