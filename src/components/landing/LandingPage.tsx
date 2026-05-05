import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  GraduationCap, Shield, BookOpen, User, ArrowRight,
  BarChart3, QrCode, Users, Zap, CheckCircle2,
  ShieldCheck, Terminal, Globe, Layers,
  ChevronRight, Sparkles, ArrowDown, Sun, Moon,
} from "lucide-react";
import { useThemeStore } from "../../hooks/useThemeStore";
import { useAuthStore, getRoleDashboardPath } from "../../hooks/useAuthStore";

import HyperText from "../ui/HyperText";
import GridHoverEffect from "../ui/GridHoverEffect";
import MockBrowserWindow from "../ui/MockBrowserWindow";
import TerminalAnimation from "../ui/TerminalAnimation";
import ContactFormGrid from "./ContactFormGrid";

/* ─── Constants ─────────────────────────────────────── */
const FEATURES = [
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    desc: "Live attendance dashboards with instant KPI tracking and trend visualization.",
  },
  {
    icon: QrCode,
    title: "QR-based Attendance",
    desc: "Generate dynamic QR codes for instant, paperless attendance marking.",
  },
  {
    icon: Users,
    title: "Role-based Access",
    desc: "Granular Admin, Faculty & Student dashboards with RBAC security.",
  },
  {
    icon: Zap,
    title: "Instant Reports",
    desc: "Export analytics to PDF, Excel & CSV with one-click generation.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    desc: "JWT auth, rate limiting, helmet headers & end-to-end data encryption.",
  },
  {
    icon: Layers,
    title: "Smart Scheduling",
    desc: "Automated program-year mapping with intelligent subject assignment.",
  },
];

const ROLES = [
  {
    role: "admin" as const,
    label: "Administrator",
    email: "admin@admin.in",
    icon: Shield,
    gradient: "from-[var(--border-strong)] to-[var(--text-muted)]",
    desc: "Full system control, analytics & user management",
    features: ["Dashboard KPIs", "User management", "Reports & exports", "System alerts"],
  },
  {
    role: "faculty" as const,
    label: "Faculty",
    email: "rajesh@faculty.in",
    icon: BookOpen,
    gradient: "from-[var(--text-muted)] to-[var(--text-primary)]",
    desc: "Mark attendance, QR sessions & leave approvals",
    features: ["Mark attendance", "QR generation", "Leave management", "Class reports"],
  },
  {
    role: "student" as const,
    label: "Student",
    email: "arjun.patel@jlu.edu.in",
    icon: User,
    gradient: "from-[var(--border-strong)] via-[var(--text-muted)] to-[var(--text-primary)]",
    desc: "Personal dashboard, attendance tracking & leave requests",
    features: ["Attendance overview", "Subject breakdown", "Leave requests", "Risk alerts"],
  },
];

const TERMINAL_LINES = [
  { text: "npm run dev:all", type: "command" as const, delay: 300 },
  { text: "Starting AMS Attendance Management System...", type: "info" as const },
  { text: "", type: "output" as const },
  { text: "  VITE v7.2.4  ready in 2706 ms", type: "success" as const },
  { text: "  ➜  Local:   http://localhost:5173/", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "  🚀 Server running on http://localhost:5000", type: "success" as const },
  { text: "  📝 Environment: development", type: "info" as const },
  { text: "  🔗 API: http://localhost:5000/api/v1", type: "info" as const },
  { text: "", type: "output" as const },
  { text: "curl http://localhost:5000/api/v1/health", type: "command" as const, delay: 800 },
  { text: '  { "success": true, "status": "healthy" }', type: "success" as const },
  { text: "", type: "output" as const },
  { text: "✓ All systems operational", type: "success" as const },
];

const STATS = [
  { value: "2,400+", label: "Students Tracked" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "50ms", label: "Avg Response" },
  { value: "256-bit", label: "AES Encryption" },
];

/* ─── Component ─────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const rolesRef = useRef<HTMLDivElement>(null);

  /* GSAP entrance animations */
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text
      gsap.fromTo(
        ".hero-animate",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );

      // Stats counter
      gsap.fromTo(
        ".stat-item",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power2.out", delay: 0.8 }
      );

      // Feature cards
      gsap.fromTo(
        ".feature-card",
        { y: 30, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.08,
          duration: 0.5,
          ease: "power2.out",
          delay: 1.0,
        }
      );

      // Role cards
      gsap.fromTo(
        ".role-card",
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.6,
          ease: "power3.out",
          delay: 0.3,
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const handleDemoLogin = async (email: string) => {
    try {
      const u = await login(email, "password123");
      navigate(getRoleDashboardPath(u.role), { replace: true });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-x-hidden">
      {/* ═══════ NAVBAR ═══════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-strong)]/15"
        style={{ background: "rgba(9, 20, 19, 0.8)", backdropFilter: "blur(20px)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--border-strong)] to-[var(--text-muted)] shadow-lg shadow-[var(--text-muted)]/20">
              <GraduationCap className="h-5 w-5 text-[var(--text-primary)]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">AMS</p>
              <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-[0.15em]">Jagran Lakecity University</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] transition-colors">Features</a>
            <a href="#roles" className="text-sm text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] transition-colors">Roles</a>
            <a href="#tech" className="text-sm text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] transition-colors">Tech Stack</a>
            <a href="#contact" className="text-sm text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 rounded-xl text-[var(--text-primary)] hover:bg-[var(--border-strong)]/20 transition-all border border-[var(--border-strong)]/30 glass"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--border-strong)] to-[var(--text-muted)] px-5 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-lg shadow-[var(--text-muted)]/20 hover:shadow-[var(--text-muted)]/40 hover:brightness-110 transition-all group"
            >
            Sign In
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════ HERO SECTION ═══════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-16">
        {/* Grid hover effect background */}
        <GridHoverEffect rows={15} cols={25} />

        {/* Gradient orbs */}
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-[var(--text-muted)]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-[var(--border-strong)]/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left – Hero content */}
            <div>

              {/* Heading */}
              <h1 className="hero-animate text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
                <HyperText
                  text="Smart"
                  className="text-[var(--text-primary)]"
                  duration={600}
                  delay={400}
                />
                <br />
                <span className="bg-gradient-to-r from-[var(--text-muted)] via-[var(--text-primary)] to-[var(--text-muted)] bg-clip-text text-transparent">
                  <HyperText text="Attendance" duration={800} delay={600} />
                </span>
                <br />
                <HyperText
                  text="System."
                  className="text-[var(--text-primary)]/60"
                  duration={600}
                  delay={800}
                />
              </h1>

              {/* Subheading */}
              <p className="hero-animate mt-6 text-lg text-[var(--text-primary)]/50 max-w-lg leading-relaxed">
                The complete attendance management platform for{" "}
                <span className="text-[var(--text-primary)] font-medium">Jagran Lakecity University</span> —
                from QR check-ins to real-time analytics, built for scale.
              </p>

              {/* CTA buttons */}
              <div className="hero-animate flex flex-wrap gap-4 mt-10">
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--border-strong)] to-[var(--text-muted)] px-7 py-3.5 text-sm font-semibold text-[var(--text-primary)] shadow-xl shadow-[var(--text-muted)]/25 hover:shadow-[var(--text-muted)]/40 hover:brightness-110 transition-all group"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#features"
                  className="flex items-center gap-2 rounded-xl border border-[var(--border-strong)]/40 px-7 py-3.5 text-sm font-medium text-[var(--text-primary)]/70 hover:bg-[var(--border-strong)]/10 hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]/40 transition-all"
                >
                  Explore Features
                  <ArrowDown className="h-4 w-4" />
                </a>
              </div>

              {/* Stats */}
              <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-14 pt-8 border-t border-[var(--border-strong)]/20">
                {STATS.map((stat) => (
                  <div key={stat.label} className="stat-item">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – Mock browser window */}
            <div className="hero-animate hidden lg:block">
              <MockBrowserWindow url="https://ams.jlu.edu.in/admin/dashboard" className="transform hover:scale-[1.02] transition-transform duration-500">
                <div className="p-6 space-y-4" style={{ background: "rgba(9, 20, 19, 0.95)" }}>
                  {/* Mini dashboard mockup */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Admin Dashboard</p>
                      <p className="text-lg font-bold text-[var(--text-primary)] mt-1">Welcome back, Vikram</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--border-strong)] to-[var(--text-muted)] text-[var(--text-primary)] text-xs font-bold">VS</div>
                  </div>

                  {/* KPI row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total Students", value: "1,247", change: "+12%", up: true },
                      { label: "Today's Attendance", value: "89.2%", change: "+3.1%", up: true },
                      { label: "Active Sessions", value: "24", change: "Live", up: true },
                    ].map((kpi) => (
                      <div key={kpi.label} className="rounded-xl border border-[var(--border-strong)]/20 p-3" style={{ background: "rgba(40, 90, 72, 0.08)" }}>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{kpi.label}</p>
                        <p className="text-xl font-bold text-[var(--text-primary)] mt-1">{kpi.value}</p>
                        <p className="text-xs text-[var(--text-primary)]/50 mt-0.5 flex items-center gap-1">
                          <span className="text-[var(--text-primary)]">↑</span> {kpi.change}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Mini chart placeholder */}
                  <div className="rounded-xl border border-[var(--border-strong)]/20 p-4" style={{ background: "rgba(40, 90, 72, 0.05)" }}>
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Weekly Attendance Trend</p>
                    <div className="flex items-end gap-2 h-20">
                      {[65, 78, 82, 71, 89, 92, 87].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-[var(--border-strong)] to-[var(--text-muted)]" style={{ height: `${h}%`, opacity: 0.3 + (i / 10) }} />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                        <span key={d} className="text-[9px] text-[var(--text-muted)]/60 flex-1 text-center">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </MockBrowserWindow>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Scroll</span>
          <ArrowDown className="h-4 w-4 text-[var(--text-muted)]" />
        </div>
      </section>

      {/* ═══════ FEATURES SECTION ═══════ */}
      <section id="features" ref={featuresRef} className="relative py-28 px-6 features-section">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)]/40 bg-[var(--border-strong)]/10 px-4 py-1.5 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <span className="text-xs font-medium text-[var(--text-primary)]/80">Platform Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="text-[var(--text-primary)]">Everything You Need,</span>
              <br />
              <span className="bg-gradient-to-r from-[var(--text-muted)] to-[var(--text-primary)] bg-clip-text text-transparent">
                Nothing You Don't.
              </span>
            </h2>
            <p className="text-[var(--text-primary)]/50 max-w-lg mx-auto text-base">
              Built with modern technology, designed for real-world university scale.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="feature-card group relative rounded-2xl border border-[var(--border-strong)]/20 p-6 transition-all duration-300 hover:border-[var(--text-muted)]/40 hover:shadow-xl hover:shadow-[var(--text-muted)]/5 hover:-translate-y-1 cursor-default"
                  style={{ background: "rgba(9, 20, 19, 0.5)", backdropFilter: "blur(8px)" }}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--text-muted)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--border-strong)]/20 border border-[var(--border-strong)]/30 text-[var(--text-muted)] mb-5 group-hover:bg-[var(--text-muted)]/15 group-hover:text-[var(--text-primary)] group-hover:border-[var(--text-muted)]/40 group-hover:scale-110 transition-all duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                    <p className="text-sm text-[var(--text-primary)]/50 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ ROLES / DEMO ACCESS SECTION ═══════ */}
      <section id="roles" ref={rolesRef} className="relative py-28 px-6">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[var(--text-muted)]/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)]/40 bg-[var(--border-strong)]/10 px-4 py-1.5 mb-6">
              <Users className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <span className="text-xs font-medium text-[var(--text-primary)]/80">Role-based Access</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="text-[var(--text-primary)]">Try Any </span>
              <span className="bg-gradient-to-r from-[var(--text-muted)] to-[var(--text-primary)] bg-clip-text text-transparent">
                Dashboard
              </span>
            </h2>
            <p className="text-[var(--text-primary)]/50 max-w-lg mx-auto text-base">
              Jump straight into a demo with full access — no signup required.
            </p>
          </div>

          {/* Role cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.role}
                  className="role-card group relative rounded-2xl border border-[var(--border-strong)]/20 overflow-hidden transition-all duration-400 hover:border-[var(--text-muted)]/40 hover:shadow-2xl hover:shadow-[var(--text-muted)]/10 hover:-translate-y-2"
                  style={{ background: "rgba(9, 20, 19, 0.6)", backdropFilter: "blur(12px)" }}
                >
                  {/* Top gradient strip */}
                  <div className={`h-1 w-full bg-gradient-to-r ${role.gradient}`} />

                  <div className="p-7">
                    {/* Icon & title */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${role.gradient} shadow-lg shadow-[var(--text-muted)]/20 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-5 w-5 text-[var(--text-primary)]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">{role.label}</h3>
                        <p className="text-xs text-[var(--text-muted)] font-mono">{role.email}</p>
                      </div>
                    </div>

                    <p className="text-sm text-[var(--text-primary)]/50 mb-5 leading-relaxed">{role.desc}</p>

                    {/* Feature list */}
                    <ul className="space-y-2.5 mb-7">
                      {role.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-[var(--text-primary)]/70">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--text-muted)] flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={() => handleDemoLogin(role.email)}
                      className={`w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${role.gradient} px-4 py-3 text-sm font-semibold text-[var(--text-primary)] shadow-lg shadow-[var(--text-muted)]/15 hover:shadow-[var(--text-muted)]/30 hover:brightness-110 transition-all group/btn`}
                    >
                      Sign in as {role.label}
                      <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center mt-8 text-xs text-[var(--text-muted)]">
            All demo accounts use password{" "}
            <code className="font-mono text-[var(--text-primary)]/60 bg-[var(--border-strong)]/15 px-2 py-0.5 rounded border border-[var(--border-strong)]/20">password123</code>
          </p>
        </div>
      </section>

      {/* ═══════ TECH STACK / TERMINAL SECTION ═══════ */}
      <section id="tech" className="relative py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left – Terminal */}
            <div>
              <TerminalAnimation
                lines={TERMINAL_LINES}
                title="ams — zsh — 80×24"
                typingSpeed={30}
                className="transform hover:scale-[1.02] transition-transform duration-500"
              />
            </div>

            {/* Right – Tech info */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)]/40 bg-[var(--border-strong)]/10 px-4 py-1.5 mb-6">
                <Terminal className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span className="text-xs font-medium text-[var(--text-primary)]/80">Tech Stack</span>
              </div>

              <h2 className="text-4xl font-bold tracking-tight mb-4">
                <span className="text-[var(--text-primary)]">Built With </span>
                <span className="bg-gradient-to-r from-[var(--text-muted)] to-[var(--text-primary)] bg-clip-text text-transparent">
                  Modern Tools
                </span>
              </h2>

              <p className="text-[var(--text-primary)]/50 mb-8 leading-relaxed">
                A full-stack architecture designed for performance, security, and developer experience.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Frontend", items: ["React 19", "Vite 7", "TypeScript", "Tailwind CSS 4"] },
                  { label: "Backend", items: ["Node.js", "Express 5", "PostgreSQL 16", "JWT Auth"] },
                  { label: "Features", items: ["GSAP Animations", "QR Generation", "PDF Export", "Real-time Sync"] },
                  { label: "DevOps", items: ["Hot Reload", "Rate Limiting", "Helmet Security", "CORS Config"] },
                ].map((group) => (
                  <div key={group.label} className="rounded-xl border border-[var(--border-strong)]/20 p-4" style={{ background: "rgba(9, 20, 19, 0.4)" }}>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">{group.label}</p>
                    <ul className="space-y-1.5">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-[var(--text-primary)]/60">
                          <Globe className="h-3 w-3 text-[var(--text-muted)]/60" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CONTACT FORM SECTION ═══════ */}
      <ContactFormGrid />

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-[var(--border-strong)]/15 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--border-strong)] to-[var(--text-muted)]">
              <GraduationCap className="h-4 w-4 text-[var(--text-primary)]" />
            </div>
            <span className="text-sm text-[var(--text-primary)]/40">
              © 2026 AMS — Jagran Lakecity University. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
