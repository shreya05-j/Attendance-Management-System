import { useState, useMemo } from "react";
import { Plus, Calendar, FileText, X, CheckCircle2, Clock, XCircle, Lock } from "lucide-react";
import { mockLeaves, MockLeave } from "../lib/mockData";
import { useAuthStore } from "../hooks/useAuthStore";
import Select from "../components/ui/Select";

export default function LeavesPage() {
  const { user } = useAuthStore();
  const isStudent = user?.role === "student";

  const [filter, setFilter] = useState("all");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [leaves, setLeaves] = useState<MockLeave[]>(mockLeaves);

  // ─── Visibility rule ────────────────────────────────
  // Students see ONLY their own leaves.
  // Faculty/Admin see all leaves (so they can approve/reject).
  const visibleLeaves = useMemo(() => {
    if (isStudent) {
      // Match the logged-in student's name (mock auth uses email-derived name)
      // For demo purposes, we'll show a small subset that "belongs" to this student
      const studentName = user?.name || "";
      const myLeaves = leaves.filter((l) => l.student_name.toLowerCase() === studentName.toLowerCase());

      // If no exact match (most demo cases), assign the first 3 leaves to this student
      if (myLeaves.length === 0) {
        return leaves.slice(0, 3).map((l) => ({
          ...l,
          student_name: user?.name || l.student_name,
          roll_no: user?.roll_no || l.roll_no,
          course_name: user?.course_name || l.course_name,
        }));
      }
      return myLeaves;
    }
    return leaves;
  }, [leaves, isStudent, user]);

  const filtered = filter === "all" ? visibleLeaves : visibleLeaves.filter((l) => l.status === filter);

  // ─── Action handlers (faculty/admin only) ───────────
  const handleAction = (id: string, status: "approved" | "rejected") => {
    if (isStudent) return;
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  // ─── Submit a new leave request ─────────────────────
  const [form, setForm] = useState({
    leave_type: "sick" as "sick" | "casual" | "annual" | "other",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const submitRequest = () => {
    if (!form.start_date || !form.end_date || !form.reason) return;
    const newLeave: MockLeave = {
      id: `lv_${Date.now()}`,
      student_name: user?.name || "Student",
      roll_no: user?.roll_no || "STU0001",
      course_name: user?.course_name || "B.Tech CS",
      leave_type: form.leave_type,
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason,
      status: "pending",
    };
    setLeaves((prev) => [newLeave, ...prev]);
    setShowRequestModal(false);
    setForm({ leave_type: "sick", start_date: "", end_date: "", reason: "" });
  };

  // ─── Stats ──────────────────────────────────────────
  const stats = {
    pending: visibleLeaves.filter((l) => l.status === "pending").length,
    approved: visibleLeaves.filter((l) => l.status === "approved").length,
    rejected: visibleLeaves.filter((l) => l.status === "rejected").length,
    total: visibleLeaves.length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            {isStudent ? "My Leave Requests" : "Leave Requests"}
          </h1>
          <p className="text-gray-400 mt-1.5 text-sm">
            {isStudent
              ? "Track the status of your submitted leave requests."
              : "Review and approve student leave applications."}
          </p>
        </div>
        {isStudent && (
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
          >
            <Plus className="h-4 w-4" /> Request Leave
          </button>
        )}
      </div>

      {/* Privacy notice for students */}
      {isStudent && (
        <div className="flex items-center gap-3 rounded-xl glass border border-cyan-500/20 bg-cyan-500/5 p-3 text-sm text-cyan-300">
          <Lock className="h-4 w-4 flex-shrink-0" />
          <span>You can only view your own leave requests. Other students' data is private.</span>
        </div>
      )}

      {/* Quick stats for student */}
      {isStudent && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBox icon={<FileText className="h-4 w-4" />} label="Total Requests" value={stats.total} gradient="from-indigo-500 to-purple-600" />
          <StatBox icon={<Clock className="h-4 w-4" />} label="Pending" value={stats.pending} gradient="from-amber-500 to-orange-600" />
          <StatBox icon={<CheckCircle2 className="h-4 w-4" />} label="Approved" value={stats.approved} gradient="from-emerald-500 to-teal-600" />
          <StatBox icon={<XCircle className="h-4 w-4" />} label="Rejected" value={stats.rejected} gradient="from-red-500 to-rose-600" />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "approved", label: "Approved" },
          { key: "rejected", label: "Rejected" },
        ].map((tab) => {
          const count =
            tab.key === "all"
              ? visibleLeaves.length
              : visibleLeaves.filter((l) => l.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === tab.key
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Leave cards */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl border border-white/10 p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-600 opacity-50" />
          <p className="text-sm text-gray-400">
            {isStudent
              ? filter === "all"
                ? "You haven't submitted any leave requests yet."
                : `No ${filter} leave requests.`
              : "No leave requests to review."}
          </p>
          {isStudent && filter === "all" && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> Submit your first request
            </button>
          )}
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${isStudent ? "lg:grid-cols-2" : "lg:grid-cols-2"} gap-4`}>
          {filtered.map((l) => {
            const statusColors: Record<string, string> = {
              pending: "bg-amber-500/10 text-amber-300 border-amber-500/20",
              approved: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
              rejected: "bg-red-500/10 text-red-300 border-red-500/20",
            };
            const StatusIcon =
              l.status === "approved" ? CheckCircle2 : l.status === "rejected" ? XCircle : Clock;

            return (
              <div key={l.id} className="glass rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      {/* Hide student details for student view (it's redundant — they know it's theirs) */}
                      {isStudent ? (
                        <>
                          <p className="text-sm font-semibold text-white capitalize">{l.leave_type} Leave</p>
                          <p className="text-xs text-gray-500">Submitted request</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-white">{l.student_name}</p>
                          <p className="text-xs text-gray-500">{l.roll_no} · {l.course_name}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[l.status]}`}>
                    <StatusIcon className="h-3 w-3" />
                    {l.status}
                  </span>
                </div>

                {/* Date range */}
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{l.start_date} → {l.end_date}</span>
                  {!isStudent && (
                    <span className="text-xs text-gray-500 capitalize">· {l.leave_type}</span>
                  )}
                </div>

                {/* Reason */}
                <p className="text-sm text-gray-400 italic mt-2 line-clamp-2">"{l.reason}"</p>

                {/* Status detail for student */}
                {isStudent && l.status !== "pending" && (
                  <div className={`mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs ${
                    l.status === "approved" ? "text-emerald-400" : "text-red-400"
                  }`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      Your request has been {l.status === "approved" ? "approved by faculty" : "rejected"}.
                    </span>
                  </div>
                )}
                {isStudent && l.status === "pending" && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-amber-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-medium">Awaiting faculty review...</span>
                  </div>
                )}

                {/* Approve/Reject buttons (only for faculty/admin) */}
                {!isStudent && l.status === "pending" && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                    <button
                      onClick={() => handleAction(l.id, "approved")}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-2 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(l.id, "rejected")}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 px-3 py-2 text-xs font-medium hover:bg-red-500/20 transition-colors"
                    >
                      <XCircle className="h-3 w-3" /> Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Request Modal (Student only) ──────────────── */}
      {showRequestModal && isStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowRequestModal(false)}>
          <div className="w-full max-w-md glass-strong rounded-2xl border border-white/10 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-white">New Leave Request</h2>
                <p className="text-xs text-gray-500 mt-0.5">Submit a new request for review</p>
              </div>
              <button onClick={() => setShowRequestModal(false)} className="rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Leave Type</label>
                <Select
                  value={form.leave_type}
                  onChange={(v) => setForm({ ...form, leave_type: v as any })}
                  options={[
                    { value: "sick", label: "Sick Leave", description: "For medical reasons" },
                    { value: "casual", label: "Casual Leave", description: "Short-term personal" },
                    { value: "annual", label: "Annual Leave", description: "Vacation / planned" },
                    { value: "other", label: "Other", description: "Any other reason" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white focus:border-indigo-400/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white focus:border-indigo-400/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Reason</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  rows={3}
                  placeholder="Briefly describe the reason for your leave..."
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-400/50 focus:outline-none resize-none"
                />
              </div>

              <button
                onClick={submitRequest}
                disabled={!form.start_date || !form.end_date || !form.reason}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Plus className="h-4 w-4" />
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ icon, label, value, gradient }: any) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-4 hover:border-white/20 transition-all">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
