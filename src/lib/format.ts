export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(dateStr: string | null): string {
  if (!dateStr) return "--:--";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    present: "bg-green-100 text-green-800",
    absent: "bg-red-100 text-red-800",
    late: "bg-yellow-100 text-yellow-800",
    leave: "bg-purple-100 text-purple-800",
    holiday: "bg-blue-100 text-blue-800",
    pending: "bg-gray-100 text-gray-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
}

export const roleBadgeClass = (role: string): string => {
  const map: Record<string, string> = {
    admin: "bg-purple-100 text-purple-800",
    faculty: "bg-blue-100 text-blue-800",
    student: "bg-green-100 text-green-800",
  };
  return map[role] || "bg-gray-100 text-gray-800";
};

export function attendancePercentage(present: number, total: number): string {
  if (total === 0) return "0%";
  return Math.round((present / total) * 100) + "%";
}
