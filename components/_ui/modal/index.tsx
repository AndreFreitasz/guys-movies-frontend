import React from "react";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm text-white">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-xl shadow-lg bg-defaultBackgroundSecond w-full max-w-xl mt-16"
          >
            <div className="flex justify-between items-center mb-4 p-4 border-b border-gray-700">
              <div className="flex items-center">
                <p className="font-extrabold text-indigo-600 text-xl md:text-3xl">
                  GUY'S
                </p>
                <p className="font-extrabold text-white text-xl md:text-3xl ml-1">
                  Movies
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white text-2xl cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>
            {title && (
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [0, 20, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                className="px-4 pb-2"
              >
                <h2 className="text-2xl font-bold text-center mb-2">{title}</h2>
                <div className="border-b-8 rounded-lg border-indigo-600 w-20 mx-auto"></div>
              </motion.div>
            )}
            <div className="p-8 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
