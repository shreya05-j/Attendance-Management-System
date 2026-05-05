/**
 * Simulated real-time updates via Zustand + setInterval.
 * In production, this would connect to a real WebSocket server (e.g., Socket.IO or native ws).
 *
 * The interface is intentionally identical to a real WebSocket consumer so that
 * swapping in a real backend later requires only changing this file.
 */

import { create } from "zustand";

export type EventType =
  | "attendance_marked"
  | "leave_requested"
  | "leave_approved"
  | "qr_attendance"
  | "low_attendance_alert"
  | "user_login"
  | "system";

export interface RealtimeEvent {
  id: string;
  type: EventType;
  title: string;
  message: string;
  timestamp: Date;
  user?: string;
  meta?: Record<string, any>;
  read?: boolean;
}

interface RealtimeState {
  connected: boolean;
  events: RealtimeEvent[];
  unreadCount: number;
  liveUpdates: boolean;
  connect: () => void;
  disconnect: () => void;
  pushEvent: (event: Omit<RealtimeEvent, "id" | "timestamp" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  toggleLive: () => void;
}

const SAMPLE_EVENTS: Array<Omit<RealtimeEvent, "id" | "timestamp" | "read">> = [
  { type: "attendance_marked", title: "Attendance marked", message: "12 students marked present in CS301 Algorithms", user: "Dr. Rajesh Kumar" },
  { type: "leave_requested", title: "New leave request", message: "Arjun Patel requested 2-day sick leave", user: "Arjun Patel" },
  { type: "qr_attendance", title: "QR attendance", message: "8 students checked in via QR code in MA201", user: "Dr. Priya Singh" },
  { type: "low_attendance_alert", title: "Low attendance alert", message: "Neha Gupta dropped below 65% in PH301", user: "System" },
  { type: "leave_approved", title: "Leave approved", message: "Rohit Joshi's casual leave approved", user: "Dr. Anita Verma" },
  { type: "user_login", title: "User logged in", message: "New session from rajesh@faculty.in", user: "Dr. Rajesh Kumar" },
  { type: "attendance_marked", title: "Bulk update", message: "15 records updated for EC201 Digital Electronics", user: "Prof. Suresh Reddy" },
  { type: "system", title: "Backup complete", message: "Daily database backup completed successfully", user: "System" },
];

let intervalId: ReturnType<typeof setInterval> | null = null;

function uid() { return Math.random().toString(36).slice(2, 11); }

export const useRealtimeStore = create<RealtimeState>((set, get) => ({
  connected: false,
  events: [],
  unreadCount: 0,
  liveUpdates: true,

  connect: () => {
    if (intervalId) return;
    set({ connected: true });

    // Simulate connection event
    setTimeout(() => {
      get().pushEvent({
        type: "system",
        title: "Connected",
        message: "Real-time updates enabled",
        user: "System",
      });
    }, 300);

    // Push a random event every 8-15 seconds
    const tick = () => {
      if (!get().liveUpdates) return;
      const event = SAMPLE_EVENTS[Math.floor(Math.random() * SAMPLE_EVENTS.length)];
      get().pushEvent(event);
    };

    intervalId = setInterval(() => {
      const delay = Math.random() * 7000 + 8000;
      setTimeout(tick, delay);
    }, 12000);
  },

  disconnect: () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    set({ connected: false });
  },

  pushEvent: (event) => {
    const newEvent: RealtimeEvent = {
      ...event,
      id: uid(),
      timestamp: new Date(),
      read: false,
    };
    set((state) => ({
      events: [newEvent, ...state.events].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    }));
  },

  markRead: (id) => {
    set((state) => {
      const event = state.events.find((e) => e.id === id);
      if (!event || event.read) return state;
      return {
        events: state.events.map((e) => (e.id === id ? { ...e, read: true } : e)),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    });
  },

  markAllRead: () => {
    set((state) => ({
      events: state.events.map((e) => ({ ...e, read: true })),
      unreadCount: 0,
    }));
  },

  clearAll: () => {
    set({ events: [], unreadCount: 0 });
  },

  toggleLive: () => {
    set((state) => ({ liveUpdates: !state.liveUpdates }));
  },
}));
