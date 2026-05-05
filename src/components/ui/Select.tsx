import { useState, useRef, useEffect, ReactNode, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
}

/**
 * Custom dark-themed dropdown — replaces native <select>.
 * Uses a React portal so the menu always overlays parent containers.
 */
export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  icon,
  className = "",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, openUpward: false });

  // Position the menu relative to the trigger
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const menuMaxHeight = 320; // matches max-h-80 (320px)

    // If not enough room below, try to open upward
    const openUpward = spaceBelow < menuMaxHeight && spaceAbove > spaceBelow;

    setPosition({
      top: openUpward ? rect.top - 8 : rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      openUpward,
    });
  };

  useLayoutEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-3 text-sm transition-all ${
          disabled
            ? "bg-white/[0.02] border-white/5 text-gray-600 cursor-not-allowed"
            : open
            ? "bg-white/[0.07] border-indigo-400/50 text-white ring-2 ring-indigo-500/20"
            : "bg-white/5 border-white/10 text-white hover:bg-white/[0.07] hover:border-white/20"
        }`}
      >
        <span className="flex items-center gap-2 min-w-0 flex-1">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className={`truncate text-left ${selected ? "text-white" : "text-gray-500"}`}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown menu — rendered via portal to escape any parent stacking context */}
      {open && !disabled && createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: position.openUpward ? "auto" : position.top,
            bottom: position.openUpward ? window.innerHeight - position.top + 8 : "auto",
            left: position.left,
            width: position.width,
            zIndex: 99999,
            backgroundColor: "var(--menu-bg)",
            borderColor: "var(--border-default)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
          }}
          className="rounded-xl border overflow-hidden animate-fade-in"
        >
          <div className="max-h-80 overflow-y-auto py-1">
            {options.length === 0 ? (
              <div className="px-3 py-3 text-sm text-gray-500 text-center">No options available</div>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-white"
                        : "text-gray-300 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{opt.label}</p>
                      {opt.description && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{opt.description}</p>
                      )}
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-indigo-400 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
