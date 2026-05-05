import { useState, useMemo } from "react";
import {
  Mail, Send, CheckCircle2, AlertTriangle, Settings, History,
  XCircle, Loader2, Users, Clock,
} from "lucide-react";
import { useEmailAlertStore } from "../lib/emailAlerts";
import { mockStudents } from "../lib/mockData";
import { useRealtimeStore } from "../lib/realtimeStore";
import Select from "../components/ui/Select";

export default function EmailAlertsPage() {
  const { config, sentAlerts, updateConfig, sendAlert, clearAlerts } = useEmailAlertStore();
  const { pushEvent } = useRealtimeStore();
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  // Students below threshold
  const eligibleStudents = useMemo(() => {
    return mockStudents.filter((s) => s.attendance_pct < config.threshold);
  }, [config.threshold]);

  // ─── Send all eligible alerts ────────────────────────
  const handleSendAll = async () => {
    if (eligibleStudents.length === 0) return;
    setSending(true);
    setSentCount(0);

    const recipients = eligibleStudents.map((s) => ({
      name: s.name,
      email: s.email,
      attendance_pct: s.attendance_pct,
    }));

    // Send one at a time to show progress
    for (let i = 0; i < recipients.length; i++) {
      await sendAlert({
        recipient_name: recipients[i].name,
        recipient_email: recipients[i].email,
        attendance_pct: recipients[i].attendance_pct,
        subject: `⚠️ Low Attendance Alert — ${recipients[i].attendance_pct}%`,
      });
      setSentCount(i + 1);
    }

    pushEvent({
      type: "low_attendance_alert",
      title: "Bulk alerts sent",
      message: `${recipients.length} low-attendance alerts dispatched via email`,
      user: "System",
    });

    setSending(false);
  };

  const handleSendTest = async () => {
    setSending(true);
    await sendAlert({
      recipient_name: "Test User",
      recipient_email: "test@jlu.edu.in",
      attendance_pct: 65,
      subject: "📧 Test Alert from AMS",
    });
    setSending(false);
  };

  const sentToday = sentAlerts.filter((a) => {
    const today = new Date();
    return a.sent_at.toDateString() === today.toDateString();
  });

  const successRate = sentAlerts.length > 0
    ? Math.round((sentAlerts.filter((a) => a.status === "sent").length / sentAlerts.length) * 100)
    : 100;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
          Email Alerts
        </h1>
        <p className="text-gray-400 mt-1.5 text-sm">
          Automated low-attendance notifications to students, parents, and faculty.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<Mail className="h-4 w-4" />} label="Total Sent" value={sentAlerts.length} gradient="from-indigo-500 to-purple-600" />
        <Stat icon={<Clock className="h-4 w-4" />} label="Sent Today" value={sentToday.length} gradient="from-cyan-500 to-blue-600" />
        <Stat icon={<AlertTriangle className="h-4 w-4" />} label="Eligible Students" value={eligibleStudents.length} gradient="from-amber-500 to-orange-600" />
        <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Success Rate" value={`${successRate}%`} gradient="from-emerald-500 to-teal-600" />
      </div>

      {/* Configuration */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Settings className="h-4 w-4 text-indigo-400" /> Alert Configuration
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Control when and to whom alerts are sent</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-gray-400">{config.enabled ? "Enabled" : "Disabled"}</span>
            <button
              onClick={() => updateConfig({ enabled: !config.enabled })}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                config.enabled ? "bg-emerald-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  config.enabled ? "translate-x-5" : ""
                }`}
              />
            </button>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Threshold</label>
            <Select
              value={String(config.threshold)}
              onChange={(v) => updateConfig({ threshold: parseInt(v) })}
              options={[
                { value: "85", label: "Below 85%" },
                { value: "75", label: "Below 75%", description: "Recommended" },
                { value: "65", label: "Below 65%" },
                { value: "50", label: "Below 50%" },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Frequency</label>
            <Select
              value={config.frequency}
              onChange={(v) => updateConfig({ frequency: v as any })}
              options={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly", description: "Recommended" },
                { value: "monthly", label: "Monthly" },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Recipients</label>
            <Select
              value={config.recipientType}
              onChange={(v) => updateConfig({ recipientType: v as any })}
              options={[
                { value: "student", label: "Student only" },
                { value: "parent", label: "Parent only" },
                { value: "both", label: "Student + Parent", description: "Recommended" },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">CC Settings</label>
            <div className="space-y-2 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.ccFaculty}
                  onChange={(e) => updateConfig({ ccFaculty: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-indigo-500"
                />
                <span className="text-xs text-gray-300">CC Faculty</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.ccAdmin}
                  onChange={(e) => updateConfig({ ccAdmin: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-indigo-500"
                />
                <span className="text-xs text-gray-300">CC Admin</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-white/5">
          <button
            onClick={handleSendAll}
            disabled={sending || eligibleStudents.length === 0 || !config.enabled}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending {sentCount}/{eligibleStudents.length}...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send to {eligibleStudents.length} Eligible Students
              </>
            )}
          </button>
          <button
            onClick={handleSendTest}
            disabled={sending}
            className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Send Test
          </button>
          <button
            onClick={clearAlerts}
            className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-red-300 transition-colors ml-auto"
          >
            <XCircle className="h-4 w-4" />
            Clear History
          </button>
        </div>
      </div>

      {/* Eligible students preview */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Recipients Preview</h3>
              <p className="text-xs text-gray-500">Students who will receive alerts (below {config.threshold}%)</p>
            </div>
          </div>
          <span className="rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 px-3 py-1 text-xs font-bold">
            {eligibleStudents.length}
          </span>
        </div>

        <div className="max-h-[300px] overflow-y-auto divide-y divide-white/5">
          {eligibleStudents.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">All students are above {config.threshold}%</p>
            </div>
          ) : (
            eligibleStudents.slice(0, 15).map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                  {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{s.name}</p>
                  <p className="text-xs text-gray-500 truncate">{s.email}</p>
                </div>
                <span className={`text-sm font-bold w-12 text-right ${s.attendance_pct < 50 ? "text-red-400" : s.attendance_pct < 65 ? "text-amber-400" : "text-orange-400"}`}>
                  {s.attendance_pct}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* History */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Recently Sent</h3>
            <p className="text-xs text-gray-500">Last {Math.min(20, sentAlerts.length)} alerts dispatched</p>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto divide-y divide-white/5">
          {sentAlerts.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="h-10 w-10 text-gray-600 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-gray-500">No alerts sent yet</p>
            </div>
          ) : (
            sentAlerts.slice(0, 20).map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  a.status === "sent" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                  a.status === "failed" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                  "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  {a.status === "sent" ? <CheckCircle2 className="h-4 w-4" /> :
                   a.status === "failed" ? <XCircle className="h-4 w-4" /> :
                   <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{a.recipient_name}</p>
                  <p className="text-xs text-gray-500 truncate">{a.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{a.recipient_email}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{a.sent_at.toLocaleTimeString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, gradient }: any) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-all">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
