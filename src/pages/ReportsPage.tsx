import { useState, useMemo } from "react";
import {
  FileText, Download, FileSpreadsheet, FileType, Filter,
  Calendar, BarChart3, Users, BookOpen, CheckCircle2,
} from "lucide-react";
import { exportToPDF, exportToExcel, exportToCSV } from "../lib/exportReports";
import { mockStudents, mockSubjects, mockAttendance } from "../lib/mockData";
import Select from "../components/ui/Select";

type ReportType = "attendance" | "students" | "subjects" | "low_attendance";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("attendance");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [exporting, setExporting] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<{ type: string; format: string; time: Date } | null>(null);

  // ─── Build report data ──────────────────────────────
  const reportData = useMemo(() => {
    if (reportType === "attendance") {
      return mockAttendance
        .filter((r) => {
          if (subjectFilter !== "all" && r.subject_id !== subjectFilter) return false;
          if (r.date < dateFrom || r.date > dateTo) return false;
          return true;
        })
        .slice(0, 200)
        .map((r) => ({
          date: r.date,
          student_name: r.student_name,
          roll_no: r.roll_no,
          subject: `${r.subject_code} — ${r.subject_name}`,
          status: r.status,
          marked_by: r.marked_by,
        }));
    }
    if (reportType === "students") {
      return mockStudents.map((s) => ({
        roll_no: s.roll_no,
        name: s.name,
        email: s.email,
        course: s.course_name,
        semester: s.semester,
        attendance_pct: `${s.attendance_pct}%`,
        status: s.is_active ? "Active" : "Inactive",
      }));
    }
    if (reportType === "subjects") {
      return mockSubjects.map((s) => ({
        code: s.code,
        name: s.name,
        course: s.course_name,
        faculty: s.faculty_name,
        semester: s.semester,
        credits: s.credits,
        attendance_pct: `${s.attendance_pct}%`,
      }));
    }
    if (reportType === "low_attendance") {
      return mockStudents
        .filter((s) => s.attendance_pct < 75)
        .sort((a, b) => a.attendance_pct - b.attendance_pct)
        .map((s) => ({
          roll_no: s.roll_no,
          name: s.name,
          email: s.email,
          course: s.course_name,
          attendance_pct: `${s.attendance_pct}%`,
          severity: s.attendance_pct < 50 ? "Critical" : s.attendance_pct < 65 ? "Warning" : "Notice",
        }));
    }
    return [];
  }, [reportType, subjectFilter, dateFrom, dateTo]);

  // ─── Column definitions per report ──────────────────
  const columnsConfig = {
    attendance: [
      { header: "Date", key: "date", width: 14 },
      { header: "Student Name", key: "student_name", width: 24 },
      { header: "Roll No", key: "roll_no", width: 16 },
      { header: "Subject", key: "subject", width: 32 },
      { header: "Status", key: "status", width: 12 },
      { header: "Marked By", key: "marked_by", width: 22 },
    ],
    students: [
      { header: "Roll No", key: "roll_no", width: 16 },
      { header: "Name", key: "name", width: 24 },
      { header: "Email", key: "email", width: 28 },
      { header: "Course", key: "course", width: 26 },
      { header: "Semester", key: "semester", width: 10 },
      { header: "Attendance %", key: "attendance_pct", width: 14 },
      { header: "Status", key: "status", width: 12 },
    ],
    subjects: [
      { header: "Code", key: "code", width: 12 },
      { header: "Subject Name", key: "name", width: 28 },
      { header: "Course", key: "course", width: 26 },
      { header: "Faculty", key: "faculty", width: 22 },
      { header: "Semester", key: "semester", width: 10 },
      { header: "Credits", key: "credits", width: 10 },
      { header: "Attendance %", key: "attendance_pct", width: 14 },
    ],
    low_attendance: [
      { header: "Roll No", key: "roll_no", width: 16 },
      { header: "Name", key: "name", width: 24 },
      { header: "Email", key: "email", width: 28 },
      { header: "Course", key: "course", width: 26 },
      { header: "Attendance %", key: "attendance_pct", width: 14 },
      { header: "Severity", key: "severity", width: 14 },
    ],
  };

  const reportTitles = {
    attendance: "Attendance Records Report",
    students: "Students Master List",
    subjects: "Subjects & Faculty Allocation",
    low_attendance: "Low Attendance Alert Report",
  };

  // ─── Export handlers ────────────────────────────────
  const buildConfig = () => ({
    title: reportTitles[reportType],
    subtitle: reportType === "attendance" ? `From ${dateFrom} to ${dateTo}` : undefined,
    columns: columnsConfig[reportType],
    rows: reportData,
    filename: `AMS_${reportType}_${new Date().toISOString().split("T")[0]}`,
    meta: {
      "Total Records": String(reportData.length),
      "Generated By": "AMS — JLU",
      "Date": new Date().toLocaleDateString(),
    },
  });

  const handleExport = async (format: "pdf" | "excel" | "csv") => {
    setExporting(format);
    await new Promise((r) => setTimeout(r, 500));
    const config = buildConfig();
    if (format === "pdf") exportToPDF(config);
    else if (format === "excel") exportToExcel(config);
    else exportToCSV(config);
    setLastExport({ type: reportTitles[reportType], format: format.toUpperCase(), time: new Date() });
    setExporting(null);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
          Reports & Exports
        </h1>
        <p className="text-gray-400 mt-1.5 text-sm">
          Generate and download attendance reports in multiple formats.
        </p>
      </div>

      {/* Last export confirmation */}
      {lastExport && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">
            <strong>{lastExport.type}</strong> exported as <strong>{lastExport.format}</strong> at {lastExport.time.toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { key: "attendance", label: "Attendance", desc: "Daily records", icon: Calendar, gradient: "from-cyan-500 to-blue-600" },
          { key: "students", label: "Students", desc: "Master list", icon: Users, gradient: "from-violet-500 to-purple-600" },
          { key: "subjects", label: "Subjects", desc: "All courses", icon: BookOpen, gradient: "from-emerald-500 to-teal-600" },
          { key: "low_attendance", label: "Low Attendance", desc: "Below 75%", icon: BarChart3, gradient: "from-amber-500 to-orange-600" },
        ].map((opt) => {
          const isSelected = reportType === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setReportType(opt.key as ReportType)}
              className={`text-left p-4 rounded-2xl border transition-all ${
                isSelected
                  ? "bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border-indigo-400/40 shadow-lg shadow-indigo-500/10"
                  : "glass border-white/10 hover:border-white/20"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${opt.gradient} text-white shadow-lg mb-3`}>
                <opt.icon className="h-5 w-5" />
              </div>
              <p className={`text-sm font-semibold ${isSelected ? "text-white" : "text-gray-300"}`}>
                {opt.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl border border-white/10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Filters</h3>
          <span className="text-xs text-gray-500 ml-auto">{reportData.length.toLocaleString()} records</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {reportType === "attendance" && (
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Subject</label>
              <Select
                value={subjectFilter}
                onChange={setSubjectFilter}
                icon={<BookOpen className="h-4 w-4 text-indigo-400" />}
                options={[
                  { value: "all", label: "All Subjects" },
                  ...mockSubjects.map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` })),
                ]}
              />
            </div>
          )}
          {(reportType === "attendance") && (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-sm text-white focus:border-indigo-400/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-sm text-white focus:border-indigo-400/50 focus:outline-none"
                />
              </div>
            </>
          )}
          {reportType !== "attendance" && (
            <div className="md:col-span-3 flex items-center gap-2 text-sm text-gray-500">
              <FileText className="h-4 w-4" />
              No filters required for this report type
            </div>
          )}
        </div>
      </div>

      {/* Export buttons */}
      <div className="glass rounded-2xl border border-white/10 p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Download className="h-4 w-4 text-emerald-400" /> Export Format
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleExport("pdf")}
            disabled={!!exporting || reportData.length === 0}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20 hover:border-red-400/40 hover:from-red-500/15 hover:to-rose-500/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30">
              <FileType className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">
                {exporting === "pdf" ? "Generating..." : "Export as PDF"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Professional formatted document</p>
            </div>
            <Download className="h-4 w-4 text-red-400 group-hover:translate-y-0.5 transition-transform" />
          </button>

          <button
            onClick={() => handleExport("excel")}
            disabled={!!exporting || reportData.length === 0}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-400/40 hover:from-emerald-500/15 hover:to-teal-500/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">
                {exporting === "excel" ? "Generating..." : "Export as Excel"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">.xlsx with formatting</p>
            </div>
            <Download className="h-4 w-4 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
          </button>

          <button
            onClick={() => handleExport("csv")}
            disabled={!!exporting || reportData.length === 0}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 hover:border-cyan-400/40 hover:from-cyan-500/15 hover:to-blue-500/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">
                {exporting === "csv" ? "Generating..." : "Export as CSV"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Plain comma-separated</p>
            </div>
            <Download className="h-4 w-4 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h3 className="text-base font-semibold text-white">Preview</h3>
            <p className="text-xs text-gray-500 mt-0.5">First 10 rows · {reportData.length.toLocaleString()} total</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                {columnsConfig[reportType].map((c) => (
                  <th key={c.key} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reportData.slice(0, 10).map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  {columnsConfig[reportType].map((c) => (
                    <td key={c.key} className="px-5 py-2.5 text-gray-300">
                      {String((row as any)[c.key] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr>
                  <td colSpan={columnsConfig[reportType].length} className="px-5 py-12 text-center text-gray-500">
                    No data matches the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
