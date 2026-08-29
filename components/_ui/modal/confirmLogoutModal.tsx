import React, { useEffect } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface ModalLogoutProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmLogoutModal: React.FC<ModalLogoutProps> = ({
  isOpen,
  onClose,
  onConfirm,
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
          className="fixed inset-0 z-[80] flex items-end justify-center px-4 pb-6 sm:items-center sm:pb-0"
          role="alertdialog"
          aria-modal="true"
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="glass-strong relative z-10 w-full max-w-sm overflow-hidden rounded-[2rem] p-6 text-center shadow-lift"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
              <FaSignOutAlt size={22} />
            </span>

            <h2 className="mt-5 text-xl font-black text-white">
              Sair da sua conta?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/45">
              Seus filmes assistidos continuam salvos. Você pode entrar de novo
              quando quiser.
            </p>

            <div className="mt-7 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onConfirm}
                className="w-full rounded-2xl bg-red-500/90 px-5 py-3.5 text-sm font-bold text-white transition-all duration-300 ease-ios hover:bg-red-500 active:scale-[0.97]"
              >
                Sair agora
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3.5 text-sm font-bold text-white transition-all duration-300 ease-ios hover:bg-white/[0.12] active:scale-[0.97]"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmLogoutModal;
