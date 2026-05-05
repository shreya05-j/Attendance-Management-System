import { useState, useRef, useEffect, FormEvent } from "react";
import { gsap } from "gsap";
import {
  Send, MapPin, Phone, Mail, Clock,
  Code2, ExternalLink, Globe, CheckCircle2,
  MessageSquare, User, AtSign, Building2,
} from "lucide-react";

const CONTACT_DETAILS = [
  {
    icon: MapPin,
    label: "Address",
    value: "Jagran Lakecity University, Bhopal, MP 462044",
    color: "#408A71",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 755 405 2000",
    color: "#408A71",
  },
  {
    icon: Mail,
    label: "Email",
    value: "support@jlu.edu.in",
    color: "#408A71",
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "Mon — Fri, 9:00 AM — 5:30 PM IST",
    color: "#408A71",
  },
];

const SOCIAL_LINKS = [
  { icon: Code2, href: "#", label: "GitHub" },
  { icon: ExternalLink, href: "#", label: "LinkedIn" },
  { icon: Globe, href: "#", label: "Website" },
];

export default function ContactFormGrid() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Animate contact cards on mount
    gsap.fromTo(
      cardsRef.current.filter(Boolean),
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.3,
      }
    );
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    await new Promise((r) => setTimeout(r, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Animate success state
    if (successRef.current) {
      gsap.fromTo(
        successRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
    }

    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", department: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const inputClasses =
    "w-full rounded-xl bg-[#091413] border border-[#285A48]/30 px-4 py-3 text-sm text-[#B0E4CC] placeholder-[#285A48] focus:border-[#408A71] focus:ring-2 focus:ring-[#408A71]/20 focus:outline-none transition-all";

  return (
    <section id="contact" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#285A48]/40 bg-[#285A48]/10 px-4 py-1.5 mb-6">
            <MessageSquare className="h-3.5 w-3.5 text-[#408A71]" />
            <span className="text-xs font-medium text-[#B0E4CC]/80">Get In Touch</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-[#B0E4CC]">Contact </span>
            <span className="bg-gradient-to-r from-[#408A71] to-[#B0E4CC] bg-clip-text text-transparent">
              Our Team
            </span>
          </h2>
          <p className="text-[#B0E4CC]/50 max-w-lg mx-auto text-base">
            Have questions about the Attendance Management System? We're here to
            help you get started.
          </p>
        </div>

        {/* Grid layout */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left – Contact details (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {CONTACT_DETAILS.map((detail, i) => {
              const Icon = detail.icon;
              return (
                <div
                  key={detail.label}
                  ref={(el) => { cardsRef.current[i] = el; }}
                  className="group relative rounded-2xl border border-[#285A48]/20 p-5 transition-all duration-300 hover:border-[#408A71]/40 hover:shadow-lg hover:shadow-[#408A71]/5 cursor-default"
                  style={{ background: "rgba(9, 20, 19, 0.6)", backdropFilter: "blur(8px)" }}
                >
                  {/* Hover gradient */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#408A71]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#285A48]/20 border border-[#285A48]/30 text-[#408A71] group-hover:bg-[#408A71]/20 group-hover:text-[#B0E4CC] transition-all">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#408A71] uppercase tracking-wider mb-1">
                        {detail.label}
                      </p>
                      <p className="text-sm text-[#B0E4CC]/80 leading-relaxed">{detail.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Social links */}
            <div className="pt-4">
              <p className="text-xs font-semibold text-[#408A71] uppercase tracking-wider mb-3">
                Connect With Us
              </p>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#285A48]/30 text-[#408A71] hover:bg-[#408A71]/10 hover:border-[#408A71]/50 hover:text-[#B0E4CC] transition-all"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right – Contact form (3 cols) */}
          <div className="lg:col-span-3">
            <div
              className="relative rounded-2xl border border-[#285A48]/20 p-8 overflow-hidden"
              style={{ background: "rgba(9, 20, 19, 0.6)", backdropFilter: "blur(12px)" }}
            >
              {/* Decorative top line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#408A71]/40 to-transparent" />

              {isSubmitted ? (
                <div ref={successRef} className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#408A71]/20 border border-[#408A71]/30 mb-6">
                    <CheckCircle2 className="h-8 w-8 text-[#B0E4CC]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#B0E4CC] mb-2">Message Sent!</h3>
                  <p className="text-sm text-[#B0E4CC]/50">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#408A71] mb-2 uppercase tracking-wider">
                        <User className="h-3 w-3" /> Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Your full name"
                        className={inputClasses}
                      />
                    </div>
                    {/* Email */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#408A71] mb-2 uppercase tracking-wider">
                        <AtSign className="h-3 w-3" /> Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="you@university.edu"
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Department */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#408A71] mb-2 uppercase tracking-wider">
                        <Building2 className="h-3 w-3" /> Department
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => handleChange("department", e.target.value)}
                        className={inputClasses}
                      >
                        <option value="">Select department</option>
                        <option value="cs">Computer Science</option>
                        <option value="math">Mathematics</option>
                        <option value="physics">Physics</option>
                        <option value="electronics">Electronics</option>
                        <option value="admin">Administration</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    {/* Subject */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#408A71] mb-2 uppercase tracking-wider">
                        <Mail className="h-3 w-3" /> Subject
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        placeholder="e.g. Feature Request"
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#408A71] mb-2 uppercase tracking-wider">
                      <MessageSquare className="h-3 w-3" /> Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Tell us how we can help..."
                      className={`${inputClasses} resize-none`}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="relative w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#285A48] via-[#408A71] to-[#285A48] px-6 py-3.5 text-sm font-semibold text-[#B0E4CC] shadow-lg shadow-[#408A71]/20 hover:shadow-[#408A71]/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden group"
                  >
                    {/* Shimmer */}
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative flex items-center gap-2">
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-[#B0E4CC]/30 border-t-[#B0E4CC] rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message <Send className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
