import { useEffect, useRef, useCallback } from "react";
import { animate } from "animejs";

interface GridHoverEffectProps {
  rows?: number;
  cols?: number;
  className?: string;
  color?: string;
  duration?: number;
}

export default function GridHoverEffect({
  rows = 15,
  cols = 25,
  className = "",
  color = "rgba(64, 138, 113, 0.6)", // Deeper, more visible forest green color by default
  duration = 800,
}: GridHoverEffectProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Create an array for the grid and memoize handling logic
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellWidth = rect.width / cols;
    const cellHeight = rect.height / rows;

    const colIndex = Math.floor(x / cellWidth);
    const rowIndex = Math.floor(y / cellHeight);

    // Only process valid cells within boundaries
    if (colIndex >= 0 && colIndex < cols && rowIndex >= 0 && rowIndex < rows) {
      const index = rowIndex * cols + colIndex;
      const cells = gridRef.current.querySelectorAll('.grid-cell') as NodeListOf<HTMLElement>;
      const cell = cells[index];

      if (cell) {
        animate(cell, {
          backgroundColor: [
            { to: color, duration: 0 },
            { to: "rgba(9, 20, 19, 0.0)", duration: duration }, // Fades back to transparent
          ],
          ease: "outSine"
        });
      }
    }
  }, [cols, rows, color, duration]);

  useEffect(() => {
    const el = gridRef.current;
    if (el) {
      el.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (el) el.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <div
      ref={gridRef}
      className={`absolute inset-0 overflow-hidden pointer-events-auto ${className}`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <div
          key={i}
          data-index={i}
          className="grid-cell border border-[#285A48]/[0.1] transition-transform duration-100 ease-out hover:scale-105"
          style={{ background: "transparent" }}
        />
      ))}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#091413]/80 via-transparent to-[#091413]/20" />
    </div>
  );
}
