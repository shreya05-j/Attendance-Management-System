import {
  BarChart3, CheckCircle2, XCircle, AlertTriangle, Clock,
  ShieldAlert, Calendar, TrendingUp, Award, Target,
} from "lucide-react";
import { useAuthStore } from "../../hooks/useAuthStore";
import SessionBadge from "../../components/SessionBadge";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell,
} from "recharts";
import { mockSubjects, getAttendanceTrend } from "../../lib/mockData";

export default function StudentDashboard() {
  const { user } = useAuthStore();

  // Mock student stats
  const overall = { total: 120, present: 98, absent: 15, late: 7 };
  const overallPct = Math.round((overall.present / overall.total) * 100);
  const riskLevel: "safe" | "warning" | "danger" =
    overallPct >= 75 ? "safe" : overallPct >= 60 ? "warning" : "danger";

  const trend = getAttendanceTrend(30).map((t) => ({
    ...t,
    Attended: t.Present,
  }));

  const subjects = mockSubjects.slice(0, 6).map((s) => ({
    ...s,
    total: Math.floor(Math.random() * 40) + 20,
    present: Math.floor(Math.random() * 30) + 15,
  }));

  const pieData = [
    { name: "Present", value: overall.present, color: "#10b981" },
    { name: "Absent", value: overall.absent, color: "#ef4444" },
    { name: "Late", value: overall.late, color: "#f59e0b" },
  ];

  const RiskIcon = riskLevel === "safe" ? CheckCircle2 : riskLevel === "warning" ? AlertTriangle : ShieldAlert;
  const riskColors = {
    safe: { bg: "from-emerald-500/10 to-teal-500/10", border: "border-emerald-500/20", text: "text-emerald-300", icon: "text-emerald-400" },
    warning: { bg: "from-amber-500/10 to-orange-500/10", border: "border-amber-500/20", text: "text-amber-300", icon: "text-amber-400" },
    danger: { bg: "from-red-500/10 to-rose-500/10", border: "border-red-500/20", text: "text-red-300", icon: "text-red-400" },
  };
  const risk = riskColors[riskLevel];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Hello, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1.5 text-sm">Track your academic attendance and stay on target.</p>
        </div>
        <SessionBadge variant="full" />
      </div>

      {/* Risk Banner */}
      {riskLevel !== "safe" && (
        <div className={`rounded-2xl border bg-gradient-to-r ${risk.bg} ${risk.border} p-4 flex items-start gap-3 animate-fade-in`}>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ${risk.icon}`}>
            <RiskIcon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className={`font-semibold text-sm ${risk.text}`}>
              {riskLevel === "danger" ? "Critical: Attendance below 60%" : "Warning: Attendance below 75%"}
            </p>
            <p className={`text-xs mt-0.5 opacity-80 ${risk.text}`}>
              Current: {overallPct}% — Attend classes regularly to meet the minimum requirement.
            </p>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          label="Overall Attendance"
          value={`${overallPct}%`}
          icon={<BarChart3 className="h-5 w-5" />}
          gradient={overallPct >= 75 ? "from-emerald-500 to-teal-600" : overallPct >= 60 ? "from-amber-500 to-orange-600" : "from-red-500 to-rose-600"}
          delta={riskLevel === "safe" ? "On track ✓" : "Below target"}
          deltaPositive={riskLevel === "safe"}
        />
        <KPI
          label="Classes Attended"
          value={overall.present}
          icon={<CheckCircle2 className="h-5 w-5" />}
          gradient="from-emerald-500 to-teal-600"
          delta={`of ${overall.total} total`}
        />
        <KPI
          label="Classes Missed"
          value={overall.absent}
          icon={<XCircle className="h-5 w-5" />}
          gradient="from-red-500 to-rose-600"
        />
        <KPI
          label="Late Arrivals"
          value={overall.late}
          icon={<Clock className="h-5 w-5" />}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* Progress Bar Card */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-400" />
              Attendance Progress
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Target: 75% minimum required</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${overallPct >= 75 ? "text-emerald-400" : overallPct >= 60 ? "text-amber-400" : "text-red-400"}`}>
              {overallPct}%
            </p>
          </div>
        </div>

        <div className="relative h-4 rounded-full bg-white/5 overflow-hidden">
          {/* Target marker */}
          <div className="absolute top-0 bottom-0 w-px bg-white/30 z-10" style={{ left: "75%" }}>
            <div className="absolute -top-6 -left-3 text-[10px] text-gray-400">75%</div>
          </div>
          {/* Progress fill */}
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              overallPct >= 75
                ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                : overallPct >= 60
                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                : "bg-gradient-to-r from-red-500 to-rose-500"
            }`}
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend chart */}
        <div className="lg:col-span-2 glass rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Monthly Attendance Trend
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Last 30 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="attendedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} stroke="#374151" />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} stroke="#374151" />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
              />
              <Area type="monotone" dataKey="Attended" stroke="#06b6d4" strokeWidth={2} fill="url(#attendedGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="glass rounded-2xl border border-white/10 p-6">
          <h3 className="text-base font-semibold text-white mb-5">Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  <span className="text-gray-400">{p.name}</span>
                </div>
                <span className="font-medium text-white">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject breakdown */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              Subject-wise Breakdown
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Detailed performance per subject</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((sub) => {
            const pct = sub.total > 0 ? Math.round((sub.present / sub.total) * 100) : 0;
            const status = pct >= 75 ? "Good" : pct >= 60 ? "Warning" : "At Risk";
            const color = pct >= 75 ? "emerald" : pct >= 60 ? "amber" : "red";
            return (
              <div key={sub.id} className="rounded-xl bg-white/[0.02] border border-white/5 p-4 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{sub.name}</p>
                    <p className="text-xs text-gray-500">{sub.code}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold text-${color}-400`}>{pct}%</p>
                    <p className={`text-[10px] font-medium text-${color}-400`}>{status}</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-${color}-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span>{sub.total} classes</span>
                  <span className="text-emerald-400">{sub.present} present</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Records */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-400" />
            Recent Attendance
          </h3>
        </div>
        <div className="divide-y divide-white/5">
          {[
            { subject: "Data Structures", code: "CS201", date: "Today", status: "present" },
            { subject: "Algorithms", code: "CS301", date: "Today", status: "present" },
            { subject: "Database Systems", code: "CS302", date: "Yesterday", status: "late" },
            { subject: "Operating Systems", code: "CS401", date: "Yesterday", status: "present" },
            { subject: "Computer Networks", code: "CS402", date: "2 days ago", status: "absent" },
          ].map((r, i) => {
            const colors: Record<string, string> = {
              present: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
              absent: "text-red-400 bg-red-500/10 border-red-500/20",
              late: "text-amber-400 bg-amber-500/10 border-amber-500/20",
            };
            return (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">{r.subject}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.code} · {r.date}</p>
                </div>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${colors[r.status]}`}>
                  {r.status}
                </span>
              </div>
            );
          })}
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
