import { useEffect, useRef, useState, useCallback, type ElementType } from "react";

interface HyperTextProps {
  text: string;
  className?: string;
  duration?: number;
  delay?: number;
  as?: ElementType;
  animateOnHover?: boolean;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

export default function HyperText({
  text,
  className = "",
  duration = 800,
  delay = 0,
  as: Tag = "span",
  animateOnHover = false,
}: HyperTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const isAnimating = useRef(false);
  const rafRef = useRef<number | null>(null);

  const animate = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    const startTime = performance.now();
    const totalChars = text.length;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const revealedCount = Math.floor(progress * totalChars);

      const result = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < revealedCount) return text[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");

      setDisplayText(result);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplayText(text);
        isAnimating.current = false;
      }
    };

    rafRef.current = requestAnimationFrame(step);
  }, [text, duration]);

  useEffect(() => {
    if (!animateOnHover) {
      const timer = setTimeout(animate, delay);
      return () => clearTimeout(timer);
    }
  }, [animate, animateOnHover, delay]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <Tag
      className={className}
      onMouseEnter={animateOnHover ? animate : undefined}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {displayText}
    </Tag>
  );
}
