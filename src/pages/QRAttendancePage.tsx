import { useState, useEffect, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode, Clock, RefreshCw, CheckCircle2, Users, Smartphone,
  Wifi, WifiOff, Copy, Sparkles,
} from "lucide-react";
import { useAuthStore } from "../hooks/useAuthStore";
import { getFacultyClasses, type FacultyClass } from "../lib/academicData";
import { useRealtimeStore } from "../lib/realtimeStore";
import Select from "../components/ui/Select";

const QR_VALIDITY_SECONDS = 300; // 5 minutes

export default function QRAttendancePage() {
  const { user } = useAuthStore();
  const { pushEvent } = useRealtimeStore();
  const facultyEmail = user?.email || "";

  // ─── Class selection ────────────────────────────────
  const myClasses = useMemo(() => getFacultyClasses(facultyEmail), [facultyEmail]);
  const [selectedClassId, setSelectedClassId] = useState<string>(myClasses[0]?.id || "");
  const selectedClass = myClasses.find((c) => c.id === selectedClassId);

  // ─── QR session state ───────────────────────────────
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(QR_VALIDITY_SECONDS);
  const [checkedIn, setCheckedIn] = useState<Array<{ name: string; roll_no: string; time: Date }>>([]);
  const [sessionToken, setSessionToken] = useState<string>("");

  // Generate fresh QR token
  const generateToken = (cls: FacultyClass) => {
    return btoa(JSON.stringify({
      classId: cls.id,
      subject: cls.subject_code,
      faculty: facultyEmail,
      issuedAt: Date.now(),
      expiresAt: Date.now() + QR_VALIDITY_SECONDS * 1000,
      nonce: Math.random().toString(36).slice(2),
    }));
  };

  const startSession = () => {
    if (!selectedClass) return;
    const token = generateToken(selectedClass);
    setSessionToken(token);
    setSessionActive(true);
    setSessionStart(new Date());
    setSecondsLeft(QR_VALIDITY_SECONDS);
    setCheckedIn([]);

    pushEvent({
      type: "qr_attendance",
      title: "QR session started",
      message: `${selectedClass.subject_name} (${selectedClass.subject_code}) — students can now check in`,
      user: user?.name,
    });
  };

  const stopSession = () => {
    setSessionActive(false);
    if (selectedClass && checkedIn.length > 0) {
      pushEvent({
        type: "qr_attendance",
        title: "QR session ended",
        message: `${checkedIn.length} students checked in for ${selectedClass.subject_code}`,
        user: user?.name,
      });
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!sessionActive) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setSessionActive(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionActive]);

  // Simulate students checking in
  useEffect(() => {
    if (!sessionActive || !selectedClass) return;
    const SAMPLE_STUDENTS = [
      { name: "Arjun Patel", roll_no: "BTC1A001" },
      { name: "Neha Gupta", roll_no: "BTC1A002" },
      { name: "Rohit Joshi", roll_no: "BTC1A003" },
      { name: "Priya Sharma", roll_no: "BTC1A004" },
      { name: "Amit Yadav", roll_no: "BTC1A005" },
      { name: "Kavita Das", roll_no: "BTC1A006" },
      { name: "Ravi Mehta", roll_no: "BTC1A007" },
      { name: "Sonam Kapoor", roll_no: "BTC1A008" },
    ];

    const checkInTimer = setInterval(() => {
      if (Math.random() > 0.5 && checkedIn.length < SAMPLE_STUDENTS.length) {
        const next = SAMPLE_STUDENTS[checkedIn.length];
        setCheckedIn((prev) => [
          ...prev,
          { ...next, time: new Date() },
        ]);
      }
    }, 3000);
    return () => clearInterval(checkInTimer);
  }, [sessionActive, checkedIn.length, selectedClass]);

  const refreshToken = () => {
    if (selectedClass && sessionActive) {
      setSessionToken(generateToken(selectedClass));
      setSecondsLeft(QR_VALIDITY_SECONDS);
    }
  };

  const copyLink = async () => {
    const link = `${window.location.origin}/qr-checkin?token=${sessionToken}`;
    await navigator.clipboard.writeText(link);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPct = (secondsLeft / QR_VALIDITY_SECONDS) * 100;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            QR Attendance
          </h1>
          <p className="text-gray-400 mt-1.5 text-sm">
            Generate a QR code for students to scan and mark their own attendance.
          </p>
        </div>
        {sessionActive && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-300 font-medium">Live Session Active</span>
          </div>
        )}
      </div>

      {/* Class Selector */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Select Class
        </label>
        <Select
          value={selectedClassId}
          onChange={setSelectedClassId}
          disabled={sessionActive}
          icon={<QrCode className="h-4 w-4 text-indigo-400" />}
          options={myClasses.map((c) => ({
            value: c.id,
            label: `${c.subject_code} — ${c.subject_name}`,
            description: `${c.program} · ${c.year} · Section ${c.section}`,
          }))}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Card */}
        <div className="glass-strong rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <QrCode className="h-4 w-4 text-indigo-400" />
                Live QR Code
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {sessionActive ? "Students can scan this to check in" : "Start a session to generate QR"}
              </p>
            </div>
            {sessionActive && (
              <span className={`flex items-center gap-1.5 text-xs font-medium ${
                secondsLeft > 60 ? "text-emerald-400" : secondsLeft > 30 ? "text-amber-400" : "text-red-400"
              }`}>
                <Clock className="h-3.5 w-3.5" />
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
            )}
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className={`p-6 rounded-2xl bg-white transition-all ${sessionActive ? "shadow-2xl shadow-indigo-500/20" : "opacity-30 grayscale"}`}>
                <QRCodeSVG
                  value={sessionActive ? sessionToken : "AMS-INACTIVE-SESSION"}
                  size={220}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#0a0a0f"
                />
              </div>
              {/* Center logo overlay */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg ${sessionActive ? "" : "opacity-30"}`}>
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Progress bar */}
            {sessionActive && (
              <div className="w-full mt-5">
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      secondsLeft > 60 ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                      secondsLeft > 30 ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                      "bg-gradient-to-r from-red-500 to-rose-500"
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  QR expires in {minutes}:{String(seconds).padStart(2, "0")} · Auto-refreshes for security
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5 w-full">
              {!sessionActive ? (
                <button
                  onClick={startSession}
                  disabled={!selectedClass}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 transition-all"
                >
                  <QrCode className="h-4 w-4" />
                  Start QR Session
                </button>
              ) : (
                <>
                  <button
                    onClick={refreshToken}
                    className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-xs font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </button>
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-xs font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Link
                  </button>
                  <button
                    onClick={stopSession}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 px-3 py-2.5 text-xs font-medium hover:bg-red-500/20 transition-colors"
                  >
                    End Session
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Session info */}
          {sessionActive && selectedClass && (
            <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-500">Subject</p>
                <p className="text-white font-medium mt-0.5">{selectedClass.subject_code}</p>
              </div>
              <div>
                <p className="text-gray-500">Started</p>
                <p className="text-white font-medium mt-0.5">{sessionStart?.toLocaleTimeString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Live Check-ins */}
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                Live Check-ins
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Students appearing as they scan</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-1 text-xs font-bold">
              {checkedIn.length}
            </span>
          </div>

          <div className="max-h-[450px] overflow-y-auto">
            {checkedIn.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                {sessionActive ? (
                  <>
                    <Smartphone className="h-10 w-10 mx-auto mb-3 opacity-30 animate-pulse" />
                    <p className="text-sm font-medium text-gray-400">Waiting for students to scan...</p>
                    <p className="text-xs mt-1.5">Check-ins will appear here in real-time</p>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No active session</p>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {checkedIn.map((student, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-5 py-3 animate-fade-in hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
                      {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{student.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{student.roll_no}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2.5 py-0.5 text-[11px] font-semibold">
                        <CheckCircle2 className="h-3 w-3" />
                        Present
                      </span>
                      <p className="text-[10px] text-gray-500 mt-1">{student.time.toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info / How it works */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Wifi className="h-4 w-4 text-indigo-400" /> How QR Attendance Works
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-400">
          <div className="flex gap-3">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">1</span>
            <div>
              <p className="font-medium text-white">Faculty starts a session</p>
              <p className="text-xs mt-0.5">A 5-minute time-limited QR is generated</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">2</span>
            <div>
              <p className="font-medium text-white">Students scan with phone</p>
              <p className="text-xs mt-0.5">They use the AMS app or any QR scanner</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">3</span>
            <div>
              <p className="font-medium text-white">Auto-marked present</p>
              <p className="text-xs mt-0.5">No manual roll-call needed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
