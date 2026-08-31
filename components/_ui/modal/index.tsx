import React, { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const MOBILE_QUERY = "(max-width: 639px)";

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
}) => {
  const previousOverflowRef = useRef("");
  const isLockedRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobile(query.matches);

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (!isLockedRef.current) {
      previousOverflowRef.current = document.body.style.overflow;
      isLockedRef.current = true;
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(
    () => () => {
      if (!isLockedRef.current) return;
      document.body.style.overflow = previousOverflowRef.current;
    },
    [],
  );

  const restoreScroll = () => {
    if (!isLockedRef.current) return;
    isLockedRef.current = false;
    document.body.style.overflow = previousOverflowRef.current;
  };

  return (
    <AnimatePresence onExitComplete={restoreScroll}>
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 backdrop-blur-md" />

          <motion.div
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "12%", opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
            className="relative z-10 w-full sm:max-w-lg"
          >
            <div className="glass-strong max-h-[92vh] overflow-hidden rounded-t-[2rem] shadow-lift sm:rounded-[2rem]">
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
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
