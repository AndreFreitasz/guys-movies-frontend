import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />

          <motion.div
            initial={{ y: "100%", opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
            className="glass-strong relative z-10 max-h-[92vh] w-full overflow-hidden rounded-t-[2rem] shadow-lift sm:max-w-lg sm:rounded-[2rem]"
          >
            <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-white/20 sm:hidden" />

            <div className="flex items-center justify-between px-6 pb-4 pt-5">
              <div className="flex items-center gap-0.5">
                <span className="brand-text text-lg font-black tracking-tight">
                  GUY&apos;S
                </span>
                <span className="text-lg font-black tracking-tight text-white">
                  Filmes
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/60 transition-all duration-300 ease-ios hover:bg-white/[0.12] hover:text-white active:scale-90"
              >
                <FaTimes size={13} />
              </button>
            </div>

            <div className="hide-scrollbar max-h-[calc(92vh-5rem)] overflow-y-auto overscroll-contain px-6 pb-8">
              {title && (
                <div className="mb-6">
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-1.5 text-sm text-white/45">{subtitle}</p>
                  )}
                  <div className="mt-4 h-px w-full bg-gradient-to-r from-indigo-500/60 via-purple-500/25 to-transparent" />
                </div>
              )}
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
