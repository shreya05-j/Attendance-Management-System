import { useState, FormEvent, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { gsap } from "gsap";
import {
  GraduationCap, AlertCircle, Loader2, Shield, BookOpen, User,
  Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff, ArrowLeft,
  CheckCircle2, ShieldCheck, Zap,
} from "lucide-react";
import { useAuthStore, getRoleDashboardPath } from "../hooks/useAuthStore";
import HyperText from "../components/ui/HyperText";

const DEMO_ACCOUNTS = [
  {
    label: "Admin",
    email: "admin@admin.in",
    role: "admin" as const,
    icon: Shield,
    gradient: "from-[var(--border-strong)] to-[var(--text-muted)]",
    glow: "shadow-[var(--text-muted)]/30",
    desc: "Full system control",
  },
  {
    label: "Faculty",
    email: "rajesh@faculty.in",
    role: "faculty" as const,
    icon: BookOpen,
    gradient: "from-[var(--text-muted)] to-[var(--text-primary)]",
    glow: "shadow-[var(--text-muted)]/25",
    desc: "Mark & manage attendance",
  },
  {
    label: "Student",
    email: "arjun.patel@jlu.edu.in",
    role: "student" as const,
    icon: User,
    gradient: "from-[var(--border-strong)] via-[var(--text-muted)] to-[var(--text-primary)]",
    glow: "shadow-[var(--border-strong)]/30",
    desc: "Track your attendance",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { user, token, isLoading, error, login, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && token) {
      navigate(getRoleDashboardPath(user.role), { replace: true });
    }
  }, [user, token, navigate]);

  /* GSAP entrance */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".login-animate",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power3.out", delay: 0.15 }
      );
    });
    return () => ctx.revert();
  }, []);

  const detectedRole =
    email.toLowerCase().endsWith("@admin.in") ? "admin" :
    email.toLowerCase().endsWith("@faculty.in") ? "faculty" :
    email.toLowerCase().endsWith("@jlu.edu.in") ? "student" : null;

  const handleManualLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const u = await login(email.trim(), password || "demo");
      navigate(getRoleDashboardPath(u.role), { replace: true });
    } catch {}
  };

  const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setDemoLoading(account.role);
    setEmail(account.email);
    try {
      const u = await login(account.email, "demo");
      navigate(getRoleDashboardPath(u.role), { replace: true });
    } catch {}
    setDemoLoading(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--bg-base)]">
      {/* ─── Background ─────────────────────────────── */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[var(--text-muted)]/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[700px] h-[700px] bg-[var(--border-strong)]/12 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-[40%] left-[40%] w-[500px] h-[500px] bg-[var(--text-muted)]/6 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: "0.8s" }} />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #408A71 1px, transparent 1px), linear-gradient(to bottom, #408A71 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ─── Back to landing ──────────────────────────── */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back to Home</span>
      </Link>

      {/* ─── Main Container ────────────────────────────── */}
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* ─── LEFT: Branding ─────────────────────── */}
          <div ref={brandRef} className="hidden lg:flex flex-col gap-8">
            <div className="login-animate">

              <h1 className="text-5xl xl:text-6xl font-bold tracking-tight">
                <HyperText text="Welcome Back" className="text-[var(--text-primary)]" duration={700} delay={300} />
                <br />
                <span className="bg-gradient-to-r from-[var(--text-muted)] via-[var(--text-primary)] to-[var(--text-muted)] bg-clip-text text-transparent">
                  <HyperText text="to AMS." duration={600} delay={500} />
                </span>
              </h1>

              <p className="mt-5 text-base text-[var(--text-primary)]/40 max-w-md leading-relaxed">
                Sign in to access your personalized{" "}
                <span className="text-[var(--text-primary)]/70 font-medium">attendance dashboard</span> at
                Jagran Lakecity University.
              </p>
            </div>

            {/* Trust badges */}
            <div className="login-animate flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-primary)]/40">
                <ShieldCheck className="h-4 w-4 text-[var(--text-muted)]" />
                <span>End-to-end encrypted</span>
              </div>
              <div className="h-3 w-px bg-[var(--border-strong)]/30" />
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-primary)]/40">
                <Zap className="h-4 w-4 text-[var(--text-muted)]" />
                <span>Real-time sync</span>
              </div>
              <div className="h-3 w-px bg-[var(--border-strong)]/30" />
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-primary)]/40">
                <CheckCircle2 className="h-4 w-4 text-[var(--text-muted)]" />
                <span>FERPA compliant</span>
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Login Card ─────────────────────── */}
          <div ref={cardRef} className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            {/* Mobile logo */}
            <div className="login-animate lg:hidden text-center mb-6">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--border-strong)] to-[var(--text-muted)] shadow-2xl shadow-[var(--text-muted)]/30 mb-3">
                <GraduationCap className="h-7 w-7 text-[var(--text-primary)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">AMS</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">Jagran Lakecity University</p>
            </div>

            {/* Card */}
            <div className="login-animate relative rounded-3xl border border-[var(--border-strong)]/20 p-7 sm:p-8 shadow-2xl shadow-black/40 overflow-hidden"
              style={{ background: "rgba(9, 20, 19, 0.8)", backdropFilter: "blur(20px)" }}
            >
              {/* Top line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--text-muted)]/40 to-transparent" />

              {/* Desktop header */}
              <div className="hidden lg:flex items-center gap-3 mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--border-strong)] to-[var(--text-muted)] shadow-lg shadow-[var(--text-muted)]/20">
                  <GraduationCap className="h-5 w-5 text-[var(--text-primary)]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Welcome back</h2>
                  <p className="text-xs text-[var(--text-muted)]">Sign in to your AMS account</p>
                </div>
              </div>

              {/* Mobile heading */}
              <div className="lg:hidden mb-5">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">Welcome back</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Sign in to continue</p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300 animate-fade-in">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* ─── Login form ─────────────────────── */}
              <form onSubmit={handleManualLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                    <span>Email Address</span>
                    {detectedRole && (
                      <span className="flex items-center gap-1 normal-case font-medium px-2 py-0.5 rounded-full text-[10px] bg-[var(--text-muted)]/15 text-[var(--text-primary)] border border-[var(--text-muted)]/30">
                        <Sparkles className="h-2.5 w-2.5" />
                        {detectedRole}
                      </span>
                    )}
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--border-strong)] group-focus-within:text-[var(--text-muted)] transition-colors pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (error) clearError(); }}
                      placeholder="you@domain.in"
                      className="w-full rounded-xl bg-[var(--bg-base)] border border-[var(--border-strong)]/30 pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--border-strong)] focus:border-[var(--text-muted)]/60 focus:ring-2 focus:ring-[var(--text-muted)]/20 focus:outline-none transition-all"
                    />
                  </div>
                  {email && !detectedRole && (
                    <p className="mt-1.5 text-[11px] text-amber-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3 w-3" />
                      Use @admin.in, @faculty.in, or @jlu.edu.in
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                    <span>Password</span>
                    <button type="button" className="normal-case text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                      Forgot?
                    </button>
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--border-strong)] group-focus-within:text-[var(--text-muted)] transition-colors pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl bg-[var(--bg-base)] border border-[var(--border-strong)]/30 pl-10 pr-11 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--border-strong)] focus:border-[var(--text-muted)]/60 focus:ring-2 focus:ring-[var(--text-muted)]/20 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--border-strong)] hover:text-[var(--text-primary)] transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading || !email.trim() || !detectedRole}
                  className="relative w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--border-strong)] via-[var(--text-muted)] to-[var(--border-strong)] px-4 py-3.5 text-sm font-semibold text-[var(--text-primary)] shadow-lg shadow-[var(--text-muted)]/20 hover:shadow-[var(--text-muted)]/40 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--text-muted)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)] disabled:opacity-40 disabled:cursor-not-allowed transition-all overflow-hidden group"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative flex items-center gap-2">
                    {isLoading && demoLoading === null ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                    ) : (
                      <>Sign in <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></>
                    )}
                  </span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border-strong)]/20" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[var(--bg-base)] px-4 text-[10px] font-semibold tracking-[0.15em] text-[var(--text-muted)] uppercase"
                    style={{ background: "rgba(9, 20, 19, 0.8)" }}
                  >
                    Or quick demo access
                  </span>
                </div>
              </div>

              {/* Demo buttons */}
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((account) => {
                  const Icon = account.icon;
                  const loading = demoLoading === account.role;
                  return (
                    <button
                      key={account.role}
                      type="button"
                      onClick={() => handleDemoLogin(account)}
                      disabled={demoLoading !== null}
                      className="relative w-full flex items-center gap-3 rounded-xl bg-[var(--bg-base)]/50 border border-[var(--border-strong)]/20 px-3.5 py-3 text-left transition-all hover:bg-[var(--border-strong)]/10 hover:border-[var(--text-muted)]/30 hover:translate-x-0.5 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
                    >
                      <span className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${account.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                      <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${account.gradient} shadow-lg ${account.glow} group-hover:scale-110 transition-transform`}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin text-[var(--text-primary)]" /> : <Icon className="h-4 w-4 text-[var(--text-primary)]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">Sign in as {account.label}</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">{account.desc} · {account.email}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[var(--border-strong)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </button>
                  );
                })}
              </div>

              {/* Footer hint */}
              <p className="mt-5 text-center text-[11px] text-[var(--text-muted)]">
                Demo accounts use password{" "}
                <span className="font-mono font-medium text-[var(--text-primary)]/60 bg-[var(--border-strong)]/15 border border-[var(--border-strong)]/20 px-1.5 py-0.5 rounded">
                  password123
                </span>
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
              By signing in, you agree to our{" "}
              <span className="text-[var(--text-primary)]/50 hover:text-[var(--text-primary)] cursor-pointer transition-colors">Terms of Service</span>
              {" "}&{" "}
              <span className="text-[var(--text-primary)]/50 hover:text-[var(--text-primary)] cursor-pointer transition-colors">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom watermark */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-[var(--border-strong)] tracking-wider">
        © 2026 AMS · Jagran Lakecity University
      </div>
    </div>
  );
}
