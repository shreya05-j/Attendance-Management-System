import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Save, CheckCircle2, XCircle, Calendar, AlertTriangle,
  Loader2, BookOpen, Users, RefreshCw,
} from "lucide-react";
import { useAuthStore } from "../hooks/useAuthStore";
import { api } from "../lib/api";
import Select from "../components/ui/Select";

type Status = "present" | "absent";

interface Subject {
  id: string;
  name: string;
  code: string;
  course_name: string;
  course_code: string;
  faculty_name: string;
  semester: number;
}

interface StudentRecord {
  student_id: string;
  roll_no: string;
  name: string;
  semester: number;
  status: Status;
  locked: boolean;
  lock_reason: string;
  is_existing: boolean;
}

export default function MarkAttendancePage() {
  const { user } = useAuthStore();

  // ─── State ──────────────────────────────────────────
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [marks, setMarks] = useState<Record<string, Status>>({});

  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);

  // ─── Fetch subjects assigned to this faculty ────────
  useEffect(() => {
    async function fetchSubjects() {
      try {
        setLoadingSubjects(true);
        const res = await api.get<Subject[]>("/subjects");
        if (res.success) {
          // For faculty: filter to their subjects; for admin: show all
          const isAdmin = user?.role === "admin";
          const filtered = isAdmin
            ? res.data
            : res.data.filter((s) => s.faculty_name === user?.name);
          setSubjects(filtered);
          // Auto-select first
          if (filtered.length > 0 && !selectedSubjectId) {
            setSelectedSubjectId(filtered[0].id);
          }
        }
      } catch (err: any) {
        setMessage({ type: "error", text: `Failed to load subjects: ${err.message}` });
      } finally {
        setLoadingSubjects(false);
      }
    }
    fetchSubjects();
  }, [user]);

  // ─── Fetch students for selected subject + date ─────
  const fetchStudents = useCallback(async () => {
    if (!selectedSubjectId || !date) return;

    try {
      setLoadingStudents(true);
      setMessage(null);
      const res = await api.get<any>(`/attendance/mark-data?subject_id=${selectedSubjectId}&date=${date}`);
      if (res.success && res.data?.records) {
        setStudents(res.data.records);
        // Initialize marks from existing data (or default to present)
        const initial: Record<string, Status> = {};
        for (const r of res.data.records) {
          initial[r.student_id] = r.is_existing ? r.status : "present";
        }
        setMarks(initial);

        if (res.data.is_locked) {
          setMessage({ type: "warning", text: res.data.lock_reason || "This date is locked for editing." });
        }
      }
    } catch (err: any) {
      console.error("Failed to load students:", err);
      setMessage({ type: "error", text: `Failed to load students: ${err.message}` });
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedSubjectId, date]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ─── Selected subject info ──────────────────────────
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  // ─── Toggle individual student ──────────────────────
  const toggleStatus = (id: string) => {
    const student = students.find((s) => s.student_id === id);
    if (student?.locked) return;
    setMarks((prev) => ({
      ...prev,
      [id]: prev[id] === "present" ? "absent" : "present",
    }));
  };

  // ─── Bulk actions ───────────────────────────────────
  const markAll = (status: Status) => {
    const updated: Record<string, Status> = {};
    students.forEach((s) => {
      updated[s.student_id] = s.locked ? marks[s.student_id] || s.status : status;
    });
    setMarks(updated);
  };

  // ─── Save attendance to backend ─────────────────────
  const saveAttendance = async () => {
    if (!selectedSubjectId || students.length === 0) return;

    try {
      setSaving(true);
      setMessage(null);

      const records = students
        .filter((s) => !s.locked)
        .map((s) => ({
          student_id: s.student_id,
          status: marks[s.student_id] || "present",
        }));

      if (records.length === 0) {
        setMessage({ type: "warning", text: "All records are locked — nothing to save." });
        return;
      }

      const res = await api.post<any>("/attendance/mark", {
        subject_id: selectedSubjectId,
        date,
        records,
        remarks: "",
      });

      if (res.success) {
        const summary = (res as any).summary || {};
        const warning = (res as any).warning;
        const msgParts: string[] = [];

        if (summary.new_records > 0) msgParts.push(`${summary.new_records} new`);
        if (summary.updated_records > 0) msgParts.push(`${summary.updated_records} updated`);
        if (summary.locked_records > 0) msgParts.push(`${summary.locked_records} locked`);

        setMessage({
          type: warning ? "warning" : "success",
          text: `✓ Attendance saved — ${msgParts.join(", ")}. ${warning || ""}`.trim(),
        });

        // Refresh to get updated lock states
        fetchStudents();
      }
    } catch (err: any) {
      console.error("Failed to save attendance:", err);
      setMessage({ type: "error", text: `Failed to save: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  // ─── Stats ──────────────────────────────────────────
  const editableStudents = students.filter((s) => !s.locked);
  const presentNow = editableStudents.filter((s) => marks[s.student_id] === "present").length;
  const absentNow = editableStudents.length - presentNow;

  // ─── Loading state ──────────────────────────────────
  if (loadingSubjects) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Loading subjects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* ─── Header ─────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
          Mark Attendance
        </h1>
        <p className="text-gray-400 mt-1.5 text-sm">
          Select a subject · choose date · mark students · save to database.
        </p>
      </div>

      {/* ─── Messages ────────────────────────────────── */}
      {message && (
        <div className={`rounded-2xl border p-4 flex items-start gap-3 animate-fade-in ${
          message.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
            : message.type === "warning"
            ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
            : "bg-red-500/10 border-red-500/20 text-red-300"
        }`}>
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* ─── No subjects warning ─────────────────────── */}
      {subjects.length === 0 && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 p-6 flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-8 w-8" />
          <p className="text-sm font-medium">No subjects assigned to you yet.</p>
          <p className="text-xs text-amber-400/70">Contact admin to get subjects assigned to your profile.</p>
        </div>
      )}

      {/* ─── Step 1: Select Subject + Date ───────────── */}
      {subjects.length > 0 && (
        <div className="glass rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">1</span>
            <h3 className="text-base font-semibold text-white">Select Subject & Date</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="h-3 w-3" /> Subject
              </label>
              <Select
                value={selectedSubjectId}
                onChange={setSelectedSubjectId}
                icon={<BookOpen className="h-4 w-4 text-indigo-400" />}
                options={subjects.map((s) => ({
                  value: s.id,
                  label: `${s.code} — ${s.name}`,
                  description: `${s.course_name} · Sem ${s.semester}`,
                }))}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400 pointer-events-none z-10" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  style={{ colorScheme: "dark" }}
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-3 py-3 text-sm text-white focus:border-indigo-400/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Subject info badge */}
          {selectedSubject && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-fuchsia-500/10 border border-indigo-400/20 px-4 py-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-2.5 py-0.5 text-xs font-bold text-indigo-200">
                <BookOpen className="h-3 w-3" />
                {selectedSubject.code}
              </span>
              <span className="inline-flex items-center rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-0.5 text-xs font-medium">
                {selectedSubject.course_name}
              </span>
              <span className="inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2.5 py-0.5 text-xs font-medium">
                Semester {selectedSubject.semester}
              </span>
              <span className="text-xs text-gray-500 ml-auto hidden sm:inline">
                Faculty: {selectedSubject.faculty_name}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ─── Step 2: Mark Attendance ─────────────────── */}
      {loadingStudents ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading student list...</p>
        </div>
      ) : students.length > 0 && (
        <div className="glass rounded-2xl border border-white/10 p-6">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold">2</span>
            <h3 className="text-base font-semibold text-white">Mark Attendance</h3>
            <button
              onClick={fetchStudents}
              className="ml-2 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
              title="Refresh student list"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <span className="ml-auto flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <strong>{presentNow}</strong> present
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <XCircle className="h-3.5 w-3.5" />
                <strong>{absentNow}</strong> absent
              </span>
            </span>
          </div>

          {/* Bulk actions */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-500">Quick:</span>
            <button
              onClick={() => markAll("present")}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-1.5 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
            >
              <CheckCircle2 className="h-3 w-3" /> Mark All Present
            </button>
            <button
              onClick={() => markAll("absent")}
              className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 px-3 py-1.5 text-xs font-medium hover:bg-red-500/20 transition-colors"
            >
              <XCircle className="h-3 w-3" /> Mark All Absent
            </button>
            <span className="text-xs text-gray-500 ml-auto flex items-center gap-1.5">
              <Users className="h-3 w-3" />
              {students.length} students
            </span>
          </div>

          {/* Student grid */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] divide-y divide-white/5 max-h-[480px] overflow-y-auto">
            {students.map((s, i) => {
              const status = marks[s.student_id] || "present";
              const isPresent = status === "present";
              const isLocked = s.locked;
              return (
                <div
                  key={s.student_id}
                  onClick={() => toggleStatus(s.student_id)}
                  className={`flex items-center justify-between px-4 py-3 transition-all ${
                    isLocked
                      ? "opacity-50 cursor-not-allowed"
                      : `cursor-pointer ${isPresent ? "hover:bg-emerald-500/5" : "bg-red-500/5 hover:bg-red-500/10"}`
                  }`}
                  title={isLocked ? s.lock_reason : ""}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-6 text-right">{i + 1}.</span>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold transition-colors ${
                      isPresent
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "bg-red-500/15 text-red-300 border border-red-500/30"
                    }`}>
                      {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isPresent ? "text-white" : "text-gray-400 line-through"}`}>
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">{s.roll_no}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLocked && (
                      <span className="text-[10px] text-gray-500">🔒</span>
                    )}
                    {isPresent ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3 py-1 text-xs font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Present
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 px-3 py-1 text-xs font-semibold">
                        <XCircle className="h-3.5 w-3.5" />
                        Absent
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save button */}
          <button
            onClick={saveAttendance}
            disabled={saving || editableStudents.length === 0}
            className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Attendance · {presentNow} present, {absentNow} absent
              </>
            )}
          </button>
        </div>
      )}

      {/* No students empty state */}
      {!loadingStudents && students.length === 0 && selectedSubjectId && (
        <div className="glass rounded-2xl border border-dashed border-white/10 p-12 text-center text-gray-500">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-gray-400">
            No students enrolled in this course yet.
          </p>
          <p className="text-xs mt-1.5">Students must be enrolled in the course linked to this subject.</p>
        </div>
      )}
    </div>
  );
}
