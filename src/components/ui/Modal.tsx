import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9990] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div 
        ref={overlayRef}
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose();
        }}
        className="absolute inset-0 bg-[#091413]/80 backdrop-blur-sm transition-opacity"
      />
      
      {/* Modal Box */}
      <div 
        className={`relative w-full ${maxWidth} glass-strong rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh] animate-fade-in`}
        style={{ animationDuration: '0.2s' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content - allows scrolling if content is too large, but prevents clipping fixed dropdowns */}
        <div className="px-6 py-6 overflow-y-auto" style={{ overflow: "visible" }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
