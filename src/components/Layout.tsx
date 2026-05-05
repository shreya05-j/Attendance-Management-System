import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  Clock,
  UserCheck,
  CalendarCheck,
  UserCog,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BarChart3,
  AlertTriangle,
  Search,
  Sparkles,
  QrCode,
  Mail,
  FileDown,
  Sun,
  Moon,
} from "lucide-react";
import { useAuthStore } from "../hooks/useAuthStore";
import { useThemeStore } from "../hooks/useThemeStore";
import RealtimeNotifications from "./RealtimeNotifications";
import SessionBadge from "./SessionBadge";

interface NavItem {
  to: string;
  label: string;
  icon: any;
  roles: ("admin" | "faculty" | "student")[];
}

const navItems: NavItem[] = [
  { to: "", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "faculty", "student"] },
  { to: "/analytics", label: "Analytics", icon: BarChart3, roles: ["admin"] },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle, roles: ["admin"] },
  { to: "/courses", label: "Courses", icon: GraduationCap, roles: ["admin"] },
  { to: "/subjects", label: "Subjects", icon: BookOpen, roles: ["admin", "faculty", "student"] },
  { to: "/students", label: "Students", icon: Users, roles: ["admin", "faculty"] },
  { to: "/attendance", label: "Attendance", icon: Clock, roles: ["admin", "faculty", "student"] },
  { to: "/mark-attendance", label: "Mark Attendance", icon: UserCheck, roles: ["admin", "faculty"] },
  { to: "/qr-attendance", label: "QR Attendance", icon: QrCode, roles: ["admin", "faculty"] },
  { to: "/leaves", label: "Leaves", icon: CalendarCheck, roles: ["admin", "faculty", "student"] },
  { to: "/email-alerts", label: "Email Alerts", icon: Mail, roles: ["admin"] },
  { to: "/reports", label: "Reports", icon: FileDown, roles: ["admin", "faculty"] },
  { to: "/users", label: "Users", icon: UserCog, roles: ["admin"] },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const basePath = user?.role ? `/${user.role}` : "";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??";

  const roleConfig: Record<string, { label: string; gradient: string; bgClass: string }> = {
    admin: { label: "Administrator", gradient: "from-[#285A48] to-[#408A71]", bgClass: "bg-[#408A71]/10 text-[#B0E4CC] border-[#408A71]/20" },
    faculty: { label: "Faculty", gradient: "from-[#408A71] to-[#B0E4CC]", bgClass: "bg-[#408A71]/10 text-[#B0E4CC] border-[#408A71]/20" },
    student: { label: "Student", gradient: "from-[#285A48] to-[#B0E4CC]", bgClass: "bg-[#285A48]/15 text-[#B0E4CC] border-[#285A48]/25" },
  };

  const role = roleConfig[user?.role ?? "student"];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Sidebar ─────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col glass-strong border-r border-[#285A48]/10 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b border-[#285A48]/10 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#285A48] to-[#408A71] shadow-lg shadow-[#408A71]/20">
            <GraduationCap className="h-5 w-5 text-[#B0E4CC]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#B0E4CC]">AMS</p>
            <p className="text-[10px] text-[#408A71] uppercase tracking-wider">Jagran Lakecity University</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          <p className="px-3 py-2 text-[10px] font-semibold text-[#408A71] uppercase tracking-wider">Navigation</p>
          {navItems
            .filter((item) => item.roles.includes(user?.role as any))
            .map((item) => (
              <NavLink
                key={item.to}
                to={`${basePath}${item.to}`}
                end={item.to === ""}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#285A48]/30 to-[#408A71]/15 text-[#B0E4CC] shadow-sm border border-[#408A71]/20"
                      : "text-[#408A71] hover:bg-[#285A48]/10 hover:text-[#B0E4CC]"
                  }`
                }
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
        </nav>

        {/* User area */}
        <div className="border-t border-[#285A48]/10 p-4">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-[#285A48]/8">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${role.gradient} text-[#B0E4CC] font-semibold text-sm shadow-lg`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#B0E4CC] truncate">{user?.name}</p>
              <p className="text-xs text-[#408A71] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-red-500/10 hover:border-red-500/20"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* ─── Main Area ───────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navbar — z-50 ensures dropdowns render above page content */}
        <header className="relative z-50 flex h-16 items-center justify-between border-b border-[#285A48]/10 glass px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-[#408A71] hover:text-[#B0E4CC]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            {/* Search bar */}
            <div className="hidden md:flex items-center gap-2 rounded-xl bg-[#285A48]/8 border border-[#285A48]/15 px-3 py-1.5 w-72">
              <Search className="h-4 w-4 text-[#408A71]" />
              <input
                type="text"
                placeholder="Search anything..."
                className="bg-transparent text-sm text-[#B0E4CC] placeholder-[#285A48] focus:outline-none flex-1"
              />
              <kbd className="hidden sm:inline-flex items-center rounded-md border border-[#285A48]/20 px-1.5 py-0.5 text-[10px] font-mono text-[#408A71]">⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            {/* Session badge */}
            <SessionBadge variant="compact" className="hidden md:inline-flex" />

            {/* Role badge */}
            <span className={`hidden lg:inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${role.bgClass}`}>
              <Sparkles className="h-3 w-3" />
              {role.label}
            </span>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative rounded-xl p-2 text-[#408A71] hover:bg-[#285A48]/10 hover:text-[#B0E4CC] transition-all group"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              aria-label="Toggle theme"
            >
              <div className="relative h-4 w-4">
                <Sun
                  className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${
                    theme === "light"
                      ? "rotate-0 scale-100 opacity-100"
                      : "rotate-90 scale-0 opacity-0"
                  }`}
                />
                <Moon
                  className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${
                    theme === "dark"
                      ? "rotate-0 scale-100 opacity-100"
                      : "-rotate-90 scale-0 opacity-0"
                  }`}
                />
              </div>
            </button>

            {/* Real-time Notifications */}
            <RealtimeNotifications />

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-xl p-1 hover:bg-[#285A48]/10 transition-colors"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${role.gradient} text-[#B0E4CC] font-semibold text-xs`}>
                  {initials}
                </div>
                <ChevronDown className="h-4 w-4 text-[#408A71] hidden sm:block" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 z-[70] rounded-2xl glass-strong border border-[#285A48]/15 shadow-2xl shadow-black/40 py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-[#285A48]/10">
                      <p className="text-sm font-semibold text-[#B0E4CC]">{user?.name}</p>
                      <p className="text-xs text-[#408A71] truncate mt-0.5">{user?.email}</p>
                      <span className={`inline-block mt-2 rounded-full border px-2 py-0.5 text-[10px] font-medium ${role.bgClass}`}>
                        {role.label}
                      </span>
                    </div>
                    <button
                      onClick={() => { setProfileOpen(false); handleLogout(); }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
