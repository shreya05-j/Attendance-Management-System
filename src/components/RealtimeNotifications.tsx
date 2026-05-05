import { useEffect, useState, useRef } from "react";
import {
  Bell, Check, CheckCheck, Clock, Trash2, Wifi, WifiOff, Zap,
  UserCheck, FileText, AlertTriangle, QrCode, LogIn, Activity,
} from "lucide-react";
import { useRealtimeStore } from "../lib/realtimeStore";
import type { EventType } from "../lib/realtimeStore";

const ICON_MAP: Record<EventType, any> = {
  attendance_marked: UserCheck,
  leave_requested: FileText,
  leave_approved: Check,
  qr_attendance: QrCode,
  low_attendance_alert: AlertTriangle,
  user_login: LogIn,
  system: Activity,
};

const COLOR_MAP: Record<EventType, string> = {
  attendance_marked: "from-emerald-500 to-teal-600 text-emerald-300",
  leave_requested: "from-amber-500 to-orange-600 text-amber-300",
  leave_approved: "from-cyan-500 to-blue-600 text-cyan-300",
  qr_attendance: "from-violet-500 to-purple-600 text-violet-300",
  low_attendance_alert: "from-red-500 to-rose-600 text-red-300",
  user_login: "from-indigo-500 to-blue-600 text-indigo-300",
  system: "from-gray-500 to-slate-600 text-gray-300",
};

function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function RealtimeNotifications() {
  const {
    connected, events, unreadCount, liveUpdates,
    connect, disconnect, markAllRead, markRead, clearAll, toggleLive,
  } = useRealtimeStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
      return () => document.removeEventListener("mousedown", onClickOutside);
    }
  }, [open]);

  // Force re-render every 30s for "time ago" updates
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((x) => x + 1), 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) markAllRead();
        }}
        className="relative rounded-xl p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
        title="Real-time notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {/* Connection status dot */}
        <span className={`absolute bottom-1 right-1 h-2 w-2 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-96 z-[60] rounded-2xl border overflow-hidden animate-fade-in"
          style={{
            backgroundColor: "var(--menu-bg)",
            borderColor: "var(--border-default)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-400" />
                Live Activity
              </h3>
              <div className="flex items-center gap-1.5">
                <span className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider ${connected ? "text-emerald-400" : "text-red-400"}`}>
                  {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {connected ? "Connected" : "Offline"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-500">{events.length} event{events.length !== 1 ? "s" : ""}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleLive}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                    liveUpdates
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                      : "bg-gray-500/15 text-gray-400 border border-gray-500/20"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${liveUpdates ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
                  Live
                </button>
                {events.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-red-400 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Event list */}
          <div className="max-h-[400px] overflow-y-auto">
            {events.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-600 opacity-50" />
                <p className="text-sm text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-600 mt-1">New events will appear here in real-time</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {events.map((e) => {
                  const Icon = ICON_MAP[e.type] || Activity;
                  const colorClass = COLOR_MAP[e.type] || "from-gray-500 to-slate-600 text-gray-300";
                  const [gradientClass, textClass] = [
                    colorClass.split(" ").slice(0, 2).join(" "),
                    colorClass.split(" ").slice(2).join(" "),
                  ];
                  return (
                    <div
                      key={e.id}
                      onClick={() => markRead(e.id)}
                      className={`flex gap-3 px-4 py-3 hover:bg-white/[0.02] cursor-pointer transition-colors ${
                        !e.read ? "bg-indigo-500/5" : ""
                      }`}
                    >
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradientClass} text-white shadow-sm`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium truncate ${e.read ? "text-gray-300" : "text-white"}`}>
                            {e.title}
                          </p>
                          {!e.read && (
                            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" />
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 line-clamp-2 ${textClass}`}>{e.message}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{timeAgo(e.timestamp)}</span>
                          {e.user && (
                            <>
                              <span>·</span>
                              <span>{e.user}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {events.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/5 bg-white/[0.02]">
              <button
                onClick={markAllRead}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
