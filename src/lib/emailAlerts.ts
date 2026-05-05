/**
 * Email Alert system — frontend simulation.
 * In production this would call a backend endpoint that uses Nodemailer / SendGrid / SES.
 */

import { create } from "zustand";

export interface EmailAlertConfig {
  enabled: boolean;
  threshold: number;          // attendance % below which alerts trigger
  frequency: "daily" | "weekly" | "monthly";
  recipientType: "student" | "parent" | "both";
  ccFaculty: boolean;
  ccAdmin: boolean;
}

export interface SentAlert {
  id: string;
  recipient_name: string;
  recipient_email: string;
  attendance_pct: number;
  subject: string;
  sent_at: Date;
  status: "sent" | "failed" | "pending";
}

interface EmailAlertState {
  config: EmailAlertConfig;
  sentAlerts: SentAlert[];
  updateConfig: (patch: Partial<EmailAlertConfig>) => void;
  sendAlert: (alert: Omit<SentAlert, "id" | "sent_at" | "status">) => Promise<SentAlert>;
  sendBulkAlerts: (recipients: Array<{ name: string; email: string; attendance_pct: number }>) => Promise<SentAlert[]>;
  clearAlerts: () => void;
}

function uid() { return Math.random().toString(36).slice(2, 11); }

function loadConfig(): EmailAlertConfig {
  try {
    const raw = localStorage.getItem("email_alert_config");
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    enabled: true,
    threshold: 75,
    frequency: "weekly",
    recipientType: "both",
    ccFaculty: true,
    ccAdmin: false,
  };
}

function loadSent(): SentAlert[] {
  try {
    const raw = localStorage.getItem("email_alerts_sent");
    if (raw) {
      return JSON.parse(raw).map((a: any) => ({ ...a, sent_at: new Date(a.sent_at) }));
    }
  } catch {}
  return [];
}

function saveSent(alerts: SentAlert[]) {
  try {
    localStorage.setItem("email_alerts_sent", JSON.stringify(alerts.slice(0, 100)));
  } catch {}
}

export const useEmailAlertStore = create<EmailAlertState>((set, get) => ({
  config: loadConfig(),
  sentAlerts: loadSent(),

  updateConfig: (patch) => {
    const next = { ...get().config, ...patch };
    localStorage.setItem("email_alert_config", JSON.stringify(next));
    set({ config: next });
  },

  sendAlert: async (alert) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));

    // 95% success rate
    const status: SentAlert["status"] = Math.random() < 0.95 ? "sent" : "failed";
    const newAlert: SentAlert = {
      ...alert,
      id: uid(),
      sent_at: new Date(),
      status,
    };

    const next = [newAlert, ...get().sentAlerts].slice(0, 100);
    saveSent(next);
    set({ sentAlerts: next });
    return newAlert;
  },

  sendBulkAlerts: async (recipients) => {
    const sent: SentAlert[] = [];
    for (const r of recipients) {
      const alert = await get().sendAlert({
        recipient_name: r.name,
        recipient_email: r.email,
        attendance_pct: r.attendance_pct,
        subject: `⚠️ Low Attendance Alert — ${r.attendance_pct}%`,
      });
      sent.push(alert);
    }
    return sent;
  },

  clearAlerts: () => {
    saveSent([]);
    set({ sentAlerts: [] });
  },
}));
