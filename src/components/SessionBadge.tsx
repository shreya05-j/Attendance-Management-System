import { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { getCurrentSession, getSessionProgress, getSessionBadgeClass, getSessionGradient } from "../lib/session";

interface SessionBadgeProps {
  variant?: "compact" | "full" | "card";
  className?: string;
}

/**
 * Displays the current academic session — Odd (Jul-Dec) or Even (Jan-May).
 * Auto-updates every minute to handle session transitions.
 */
export default function SessionBadge({ variant = "compact", className = "" }: SessionBadgeProps) {
  const [session, setSession] = useState(getCurrentSession());
  const [progress, setProgress] = useState(getSessionProgress());

  useEffect(() => {
    const tick = () => {
      setSession(getCurrentSession());
      setProgress(getSessionProgress());
    };
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, []);

  // ─── COMPACT (navbar pill) ───────────────────────────
  if (variant === "compact") {
    return (
      <span
        title={`${session.label} (${session.monthsLabel}) · ${session.academicYear}`}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getSessionBadgeClass(session.type)} ${className}`}
      >
        <Calendar className="h-3 w-3" />
        <span className="hidden sm:inline">{session.shortLabel} · {session.academicYear}</span>
        <span className="sm:hidden">{session.shortLabel}</span>
      </span>
    );
  }

  // ─── FULL (subheader with progress) ──────────────────
  if (variant === "full") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${getSessionGradient(session.type)} text-white shadow-lg`}>
          <Calendar className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white">{session.label}</p>
            <span className="text-xs text-gray-500">·</span>
            <p className="text-xs text-gray-400">{session.academicYear}</p>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{session.monthsLabel} · Sem {session.type === "odd" ? "1, 3, 5, 7" : session.type === "even" ? "2, 4, 6, 8" : "—"}</p>
        </div>
      </div>
    );
  }

  // ─── CARD (full info card with progress bar) ─────────
  return (
    <div className={`glass rounded-2xl border border-white/10 p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${getSessionGradient(session.type)} text-white shadow-lg`}>
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-white">{session.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{session.monthsLabel} · {session.academicYear}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getSessionBadgeClass(session.type)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            session.type === "odd" ? "bg-amber-400" :
            session.type === "even" ? "bg-cyan-400" : "bg-gray-400"
          } animate-pulse`} />
          Active
        </span>
      </div>

      {session.type !== "break" && (
        <>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {progress.daysElapsed} days elapsed
            </span>
            <span>{progress.daysRemaining} days remaining</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getSessionGradient(session.type)} transition-all duration-1000`}
              style={{ width: `${progress.percentComplete}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 text-center">{progress.percentComplete}% complete</p>
        </>
      )}
    </div>
  );
}
