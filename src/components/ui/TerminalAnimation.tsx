import { useEffect, useState, useRef } from "react";

interface TerminalLine {
  text: string;
  type?: "command" | "output" | "success" | "error" | "info";
  delay?: number;
}

interface TerminalAnimationProps {
  lines: TerminalLine[];
  className?: string;
  title?: string;
  typingSpeed?: number;
}

export default function TerminalAnimation({
  lines,
  className = "",
  title = "Terminal",
  typingSpeed = 35,
}: TerminalAnimationProps) {
  const [visibleLines, setVisibleLines] = useState<{ text: string; type: string }[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLine >= lines.length) {
      setIsTyping(false);
      return;
    }

    const line = lines[currentLine];
    const lineDelay = line.delay || 0;

    if (currentChar === 0 && lineDelay > 0) {
      const timer = setTimeout(() => {
        setCurrentChar(1);
      }, lineDelay);
      return () => clearTimeout(timer);
    }

    if (line.type === "command") {
      if (currentChar <= line.text.length) {
        const timer = setTimeout(() => {
          setCurrentChar((c) => c + 1);
        }, typingSpeed + Math.random() * 20);
        return () => clearTimeout(timer);
      } else {
        setVisibleLines((prev) => [...prev, { text: line.text, type: line.type || "command" }]);
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }
    } else {
      // Output lines appear instantly
      setVisibleLines((prev) => [...prev, { text: line.text, type: line.type || "output" }]);
      setCurrentLine((l) => l + 1);
      setCurrentChar(0);
    }
  }, [currentLine, currentChar, lines, typingSpeed]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines, currentChar]);

  const colorMap: Record<string, string> = {
    command: "text-[#B0E4CC]",
    output: "text-[#B0E4CC]/60",
    success: "text-[#28c840]",
    error: "text-red-400",
    info: "text-[#408A71]",
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden border border-[#285A48]/30 shadow-2xl shadow-black/40 ${className}`}
      style={{ background: "rgba(9, 20, 19, 0.9)", backdropFilter: "blur(16px)" }}
    >
      {/* Terminal chrome */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#285A48]/20">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-[#B0E4CC]/40 font-mono flex-1 text-center">{title}</span>
        <div className="w-[52px]" />
      </div>

      {/* Terminal body */}
      <div ref={containerRef} className="p-4 font-mono text-sm space-y-1 max-h-80 overflow-y-auto">
        {visibleLines.map((line, i) => (
          <div key={i} className={`${colorMap[line.type] || colorMap.output} leading-relaxed`}>
            {line.type === "command" && (
              <span className="text-[#408A71] mr-2">❯</span>
            )}
            {line.text}
          </div>
        ))}

        {/* Currently typing line */}
        {isTyping && currentLine < lines.length && lines[currentLine].type === "command" && currentChar > 0 && (
          <div className="text-[#B0E4CC] leading-relaxed">
            <span className="text-[#408A71] mr-2">❯</span>
            {lines[currentLine].text.slice(0, currentChar)}
            <span className="inline-block w-2 h-4 bg-[#B0E4CC] ml-0.5 animate-pulse" />
          </div>
        )}

        {/* Cursor when idle */}
        {!isTyping && (
          <div className="text-[#B0E4CC] leading-relaxed">
            <span className="text-[#408A71] mr-2">❯</span>
            <span className="inline-block w-2 h-4 bg-[#B0E4CC] animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
