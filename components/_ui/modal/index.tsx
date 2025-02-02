import React from "react";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.5 },
};

const modalVariants = {
  hidden: { y: "-20px", opacity: 0 },
  visible: { y: "0px", opacity: 1 },
  exit: { y: "-20px", opacity: 0 },
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black"
            onClick={onClose}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2, ease: "easeInOut" }}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <motion.div
              className="relative bg-defaultBackgroundSecond rounded-xl shadow-lg w-full max-w-xl z-10"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <div className="flex justify-between items-center border-b border-gray-700 p-4">
                <div className="flex items-center">
                  <p className="font-extrabold text-indigo-600 text-xl md:text-3xl">
                    GUY'S
                  </p>
                  <p className="font-extrabold text-white text-xl md:text-3xl ml-1">
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
              {title && (
                <div className="px-4 pb-2">
                  <h2 className="text-2xl font-bold text-center mb-2 text-white mt-8">
                    {title}
                  </h2>
                  <div className="border-b-2 rounded-lg border-indigo-600 w-20 mx-auto"></div>
                </div>
              )}
              <div className="p-8 overflow-y-auto">{children}</div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
