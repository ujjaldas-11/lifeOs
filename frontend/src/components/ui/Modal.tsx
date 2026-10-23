import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, description, children, maxWidth = "max-w-lg" }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Flat Backdrop without blur */}
      <div
        className="fixed inset-0 bg-black/75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className={`relative z-50 w-full ${maxWidth} rounded-lg border border-[#222736] bg-[#13161f] shadow-2xl overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-[#222736] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#e6edf3]">{title}</h2>
            {description && <p className="text-xs text-[#8b949e] mt-0.5">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#8b949e] hover:bg-[#161922] hover:text-[#e6edf3] transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
