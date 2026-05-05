import { type ReactNode } from "react";

interface MockBrowserWindowProps {
  url?: string;
  children: ReactNode;
  className?: string;
}

export default function MockBrowserWindow({
  url = "https://ams.jlu.edu.in",
  children,
  className = "",
}: MockBrowserWindowProps) {
  return (
    <div
      className={`rounded-2xl overflow-hidden border border-[#285A48]/30 shadow-2xl shadow-black/40 ${className}`}
      style={{ background: "rgba(9, 20, 19, 0.85)", backdropFilter: "blur(16px)" }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#285A48]/20">
        {/* Traffic lights */}
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-inner" />
        </div>
        {/* URL bar */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#1a3d31] border border-[#285A48]/30 text-xs text-[#B0E4CC]/60 font-mono max-w-md w-full">
            <svg className="w-3 h-3 text-[#408A71]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="truncate">{url}</span>
          </div>
        </div>
        <div className="w-[52px]" />
      </div>

      {/* Content area */}
      <div className="relative">{children}</div>
    </div>
  );
}
