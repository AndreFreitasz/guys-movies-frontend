// filepath: /home/andre/Documentos/projetoPessoal/guys-movies-frontend/components/_ui/modal/confirmLogoutModal.tsx
import React from "react";
import { FaTimes } from "react-icons/fa";
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
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black bg-opacity-70"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <motion.div
              className="relative bg-defaultBackgroundSecond rounded-xl shadow-lg w-full max-w-xl z-10"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <div className="flex justify-between items-center border-b border-gray-700 p-4">
                <div className="flex items-center">
                  <p className="font-extrabold text-indigo-600 text-xl md:text-4xl">
                    GUY'S
                  </p>
                  <p className="font-extrabold text-white text-xl md:text-4xl ml-1">
                    Movies
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-white text-2xl cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-6 d-flex justify-center">
                <p className="text-white text-center text-2xl font-bold mb-8">
                  Você tem certeza que deseja sair?
                </p>
                <div className="flex justify-center">
                  <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-5 rounded mr-2"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={onConfirm}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmLogoutModal;
