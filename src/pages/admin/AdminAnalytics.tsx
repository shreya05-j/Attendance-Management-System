import { useMemo, useState } from "react";
import {
  Calendar, RefreshCw, BarChart3, TrendingUp, TrendingDown, Users, AlertTriangle,
  Filter, Download, Search, BookOpen,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  mockSubjects, mockStudents, mockAttendance,
  getWeeklyTrend, getMonthlyTrend, getLowAttendanceStudents,
} from "../../lib/mockData";
import Select from "../../components/ui/Select";

type TrendView = "daily" | "weekly" | "monthly";

export default function AdminAnalytics() {
  // ─── Filters ─────────────────────────────────────────
  const [trendView, setTrendView] = useState<TrendView>("daily");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [studentSearch, setStudentSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [thresholdFilter, setThresholdFilter] = useState(75);

  // ─── Filtered records ────────────────────────────────
  const filteredRecords = useMemo(() => {
    return mockAttendance.filter((r) => {
      if (subjectFilter !== "all" && r.subject_id !== subjectFilter) return false;
      if (studentFilter !== "all" && r.student_id !== studentFilter) return false;
      if (r.date < dateFrom || r.date > dateTo) return false;
      return true;
    });
  }, [subjectFilter, studentFilter, dateFrom, dateTo]);

  // ─── Stats from filtered records ─────────────────────
  const total = filteredRecords.length;
  const present = filteredRecords.filter((r) => r.status === "present").length;
  const absent = filteredRecords.filter((r) => r.status === "absent").length;
  const late = filteredRecords.filter((r) => r.status === "late").length;
  const leaveCount = filteredRecords.filter((r) => r.status === "leave").length;
  const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0;

  // ─── Daily trend (filtered) ──────────────────────────
  const dailyTrend = useMemo(() => {
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    const trend: any[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const dateStr = d.toISOString().split("T")[0];
      const dayRecords = filteredRecords.filter((r) => r.date === dateStr);
      const t = dayRecords.length;
      const p = dayRecords.filter((r) => r.status === "present").length;
      const a = dayRecords.filter((r) => r.status === "absent").length;
      const l = dayRecords.filter((r) => r.status === "late").length;
      trend.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        Present: t > 0 ? Math.round((p / t) * 100) : 0,
        Absent: t > 0 ? Math.round((a / t) * 100) : 0,
        Late: t > 0 ? Math.round((l / t) * 100) : 0,
      });
    }
    return trend.slice(-30);
  }, [filteredRecords, dateFrom, dateTo]);

  // ─── Weekly + Monthly trends ─────────────────────────
  const filterFn = (r: any) => {
    if (subjectFilter !== "all" && r.subject_id !== subjectFilter) return false;
    if (studentFilter !== "all" && r.student_id !== studentFilter) return false;
    return true;
  };

  const weeklyTrend = useMemo(() => getWeeklyTrend(filterFn), [subjectFilter, studentFilter]);
  const monthlyTrend = useMemo(() => getMonthlyTrend(filterFn), [subjectFilter, studentFilter]);

  // ─── Subject-wise breakdown (filtered) ───────────────
  const subjectBreakdown = useMemo(() => {
    const subjects = subjectFilter === "all" ? mockSubjects : mockSubjects.filter((s) => s.id === subjectFilter);
    return subjects.map((sub) => {
      const subRecords = filteredRecords.filter((r) => r.subject_id === sub.id);
      const t = subRecords.length;
      const p = subRecords.filter((r) => r.status === "present").length;
      return {
        name: sub.code,
        fullName: sub.name,
        Attendance: t > 0 ? Math.round((p / t) * 100) : 0,
        Total: t,
      };
    });
  }, [filteredRecords, subjectFilter]);

  // ─── Pie chart data ──────────────────────────────────
  const pieData = [
    { name: "Present", value: present, color: "#10b981" },
    { name: "Absent", value: absent, color: "#ef4444" },
    { name: "Late", value: late, color: "#f59e0b" },
    { name: "Leave", value: leaveCount, color: "#a855f7" },
  ].filter((d) => d.value > 0);

  // ─── Low attendance ──────────────────────────────────
  const lowAttendance = useMemo(() => {
    return getLowAttendanceStudents(thresholdFilter).slice(0, 12);
  }, [thresholdFilter]);

  // ─── Filtered students for dropdown ──────────────────
  const filteredStudents = useMemo(() => {
    if (!studentSearch) return mockStudents.slice(0, 50);
    return mockStudents.filter((s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.roll_no.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [studentSearch]);

  const resetFilters = () => {
    setSubjectFilter("all");
    setStudentFilter("all");
    setStudentSearch("");
    setDateFrom(new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]);
    setDateTo(new Date().toISOString().split("T")[0]);
  };

  const trendData =
    trendView === "daily" ? dailyTrend :
    trendView === "weekly" ? weeklyTrend : monthlyTrend;
  const trendXKey =
    trendView === "daily" ? "date" :
    trendView === "weekly" ? "week" : "month";
  const trendDataKey =
    trendView === "monthly" ? "Attendance" : "Present";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-gray-400 mt-1.5 text-sm">
            Comprehensive attendance insights and trends.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 rounded-xl glass border border-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* ─── Filter Panel ─────────────────────────────── */}
      <div className="glass rounded-2xl border border-white/10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Filters</h3>
          <span className="text-xs text-gray-500 ml-auto">{filteredRecords.length.toLocaleString()} records matched</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Subject filter */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="h-3 w-3" /> Subject
            </label>
            <Select
              value={subjectFilter}
              onChange={setSubjectFilter}
              icon={<BookOpen className="h-4 w-4 text-indigo-400" />}
              options={[
                { value: "all", label: `All Subjects (${mockSubjects.length})` },
                ...mockSubjects.map((s) => ({
                  value: s.id,
                  label: `${s.code} — ${s.name}`,
                  description: s.faculty_name,
                })),
              ]}
            />
          </div>

          {/* Student filter */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
              <Users className="h-3 w-3" /> Student
            </label>
            <Select
              value={studentFilter}
              onChange={setStudentFilter}
              icon={<Users className="h-4 w-4 text-purple-400" />}
              options={[
                { value: "all", label: "All Students" },
                ...filteredStudents.map((s) => ({
                  value: s.id,
                  label: `${s.roll_no} — ${s.name}`,
                  description: s.course_name,
                })),
              ]}
            />
          </div>

          {/* Date from */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-indigo-400/50 focus:outline-none"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-indigo-400/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Student quick search */}
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Quick-filter student dropdown by name or roll number..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none flex-1"
          />
        </div>
      </div>

      {/* ─── KPI Cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat label="Total Records" value={total.toLocaleString()} pct={100} icon={<BarChart3 className="h-4 w-4" />} gradient="from-violet-500 to-purple-600" />
        <Stat label="Attendance %" value={`${attendancePct}%`} pct={attendancePct} icon={<TrendingUp className="h-4 w-4" />} gradient={attendancePct >= 75 ? "from-emerald-500 to-teal-600" : "from-amber-500 to-orange-600"} />
        <Stat label="Present" value={present} pct={total > 0 ? Math.round((present / total) * 100) : 0} icon={<TrendingUp className="h-4 w-4" />} gradient="from-emerald-500 to-teal-600" />
        <Stat label="Absent" value={absent} pct={total > 0 ? Math.round((absent / total) * 100) : 0} icon={<TrendingDown className="h-4 w-4" />} gradient="from-red-500 to-rose-600" />
        <Stat label="Late" value={late} pct={total > 0 ? Math.round((late / total) * 100) : 0} icon={<Users className="h-4 w-4" />} gradient="from-amber-500 to-orange-600" />
      </div>

      {/* ─── Trend Chart with View Toggle ─────────────── */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              Attendance Trends
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {trendView === "daily" ? "Daily attendance %" : trendView === "weekly" ? "Weekly attendance % (last 8 weeks)" : "Monthly attendance % (last 6 months)"}
            </p>
          </div>
          <div className="inline-flex items-center rounded-xl bg-white/5 border border-white/10 p-1">
            {(["daily", "weekly", "monthly"] as const).map((view) => (
              <button
                key={view}
                onClick={() => setTrendView(view)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  trendView === view
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-purple-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          {trendView === "daily" ? (
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="presentG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="absentG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey={trendXKey} tick={{ fontSize: 11, fill: "#6b7280" }} stroke="#374151" />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} stroke="#374151" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="Present" stroke="#10b981" strokeWidth={2} fill="url(#presentG)" />
              <Area type="monotone" dataKey="Absent" stroke="#ef4444" strokeWidth={2} fill="url(#absentG)" />
              <Line type="monotone" dataKey="Late" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </AreaChart>
          ) : (
            <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey={trendXKey} tick={{ fontSize: 11, fill: "#6b7280" }} stroke="#374151" />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} stroke="#374151" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey={trendDataKey} stroke="#06b6d4" strokeWidth={3} dot={{ fill: "#06b6d4", r: 4 }} activeDot={{ r: 6 }} />
              {trendView === "weekly" && (
                <>
                  <Line type="monotone" dataKey="Absent" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Late" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </>
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* ─── Subject Breakdown + Pie ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl border border-white/10 p-6">
          <h3 className="text-base font-semibold text-white mb-1">Subject-wise Performance</h3>
          <p className="text-xs text-gray-500 mb-5">Attendance % per subject (filtered)</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={subjectBreakdown} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} stroke="#374151" />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} stroke="#374151" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                formatter={(v: any) => `${v}%`}
              />
              <Bar dataKey="Attendance" radius={[8, 8, 0, 0]}>
                {subjectBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.Attendance >= 75 ? "#10b981" : entry.Attendance >= 60 ? "#f59e0b" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl border border-white/10 p-6">
          <h3 className="text-base font-semibold text-white mb-1">Distribution</h3>
          <p className="text-xs text-gray-500 mb-5">Status breakdown</p>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-sm text-gray-500">No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {pieData.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                      <span className="text-gray-400">{p.name}</span>
                    </div>
                    <span className="font-medium text-white">
                      {p.value} <span className="text-xs text-gray-500">({Math.round((p.value / total) * 100) || 0}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Low Attendance Alerts ────────────────────── */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Low Attendance Alerts</h3>
              <p className="text-xs text-gray-500">Students below threshold</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-400">Threshold:</label>
            <div className="w-32">
              <Select
                value={String(thresholdFilter)}
                onChange={(v) => setThresholdFilter(parseInt(v))}
                options={[
                  { value: "75", label: "Below 75%" },
                  { value: "70", label: "Below 70%" },
                  { value: "60", label: "Below 60%" },
                  { value: "50", label: "Below 50%" },
                ]}
              />
            </div>
            <span className="rounded-full bg-red-500/10 border border-red-500/20 text-red-300 px-3 py-1 text-xs font-bold">
              {lowAttendance.length}
            </span>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {lowAttendance.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <TrendingUp className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm">No students below {thresholdFilter}% threshold</p>
            </div>
          ) : (
            lowAttendance.map((s) => {
              const sev = s.attendance_pct < 50 ? "Critical" : s.attendance_pct < 65 ? "Warning" : "Notice";
              const sColor = s.attendance_pct < 50 ? "red" : s.attendance_pct < 65 ? "amber" : "orange";
              const initials = s.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={s.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-${sColor}-500/10 border border-${sColor}-500/20 text-xs font-semibold text-${sColor}-300`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{s.name}</p>
                    <p className="text-xs text-gray-500 truncate">{s.roll_no} · {s.course_name}</p>
                  </div>
                  <span className={`hidden sm:inline-flex items-center rounded-full bg-${sColor}-500/10 border border-${sColor}-500/20 text-${sColor}-300 px-2.5 py-0.5 text-xs font-medium`}>
                    {sev}
                  </span>
                  <div className="text-right w-20">
                    <p className={`text-sm font-bold text-${sColor}-400`}>{s.attendance_pct}%</p>
                    <div className="h-1 mt-1 rounded-full bg-white/5 overflow-hidden">
                      <div className={`h-full rounded-full bg-${sColor}-500`} style={{ width: `${s.attendance_pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon, gradient, pct }: any) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-4 hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${gradient}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}
