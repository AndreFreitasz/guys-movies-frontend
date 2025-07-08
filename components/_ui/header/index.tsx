import React, { useEffect, useRef, useState } from "react";
import NavItem from "./navItem";
import Button from "../button";
import {
  FaUser,
  FaBars,
  FaTimes,
  FaPlus,
  FaSearch,
  FaCaretDown,
} from "react-icons/fa";
import Modal from "../modal";
import SearchBar from "../searchBar";
import { motion, AnimatePresence } from "framer-motion";
import FormRegister from "./formRegister";
import FormLogin from "./formLogin";
import { useAuth } from "../../../hooks/authContext";
import ConfirmLogoutModal from "../modal/confirmLogoutModal";
import Link from "next/link";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isAuthenticated, user, loading, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLoginClick = () => {
    setIsMenuOpen(false);
    setIsModalOpen(true);
  };

  const handleRegisterClick = () => {
    setIsMenuOpen(false);
    setIsRegisterModalOpen(true);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsSearchVisible(false);
  };

  const closeModal = () => setIsModalOpen(false);

  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  const handleSearchFocus = () => setIsSearchExpanded(true);

  const handleSearchBlur = () => setIsSearchExpanded(false);

  const toggleSearchBar = () => {
    setIsSearchVisible(!isSearchVisible);
    setIsMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    setIsLogoutModalOpen(true);
  };

  const toggleDropdown = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  return (
    <header className="h-20 flex items-center justify-between py-4 px-6 md:py-12 md:px-40 w-full z-30 relative">
      <div className="flex items-center">
        <Link href="/">
          <div className="flex items-center ml-2">
            <p className="font-extrabold text-indigo-600 text-3xl md:text-5xl">
              GUY'S
            </p>
            <p className="font-extrabold text-white text-3xl md:text-5xl ml-1">
              Filmes
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-grow flex justify-start ml-6 md:ml-10">
        <div className="hidden md:block">
          <SearchBar
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            isExpanded={isSearchExpanded}
          />
        </div>
        <button className="md:hidden" onClick={toggleSearchBar}>
          <FaSearch className="text-white text-xl" />
        </button>
      </div>

      <nav className="flex flex-row items-center">
        <AnimatePresence>
          {!isSearchExpanded && (
            <motion.ul
              className="hidden md:flex space-x-8 mr-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <NavItem href="/" label="Filmes" />
              <NavItem href="/series" label="Séries" />
            </motion.ul>
          )}
        </AnimatePresence>
        {!isSearchExpanded && !loading && (
          <>
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <Button
                  label={`@${user?.username}`}
                  onClick={toggleDropdown}
                  icon={<FaCaretDown size={24} />}
                  className="hidden md:flex"
                  ref={buttonRef}
                />
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      key="dropdown"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute right-0 mt-2 w-52 text-center bg-opacity-80 text-white rounded-lg shadow-xl z-20 inline-flex items-center justify-center px-8 py-3 overflow-hidden font-bold transition-all duration-300 bg-indigo-600 ring-offset-2 ring-1 ring-indigo-300 ring-offset-indigo-200 hover:ring-offset-indigo-500 ease focus:outline-none"
                    >
                      <ul className="divide-y divide-white/30">
                        <li className="hover:cursor-pointer">
                          <a className="block px-4 py-2 hover:bg-white/10 transition-colors duration-200">
                            Assistidos
                          </a>
                        </li>
                        <li className="hover:cursor-pointer">
                          <a className="block px-4 py-2 hover:bg-white/10 transition-colors duration-200">
                            Watchlist
                          </a>
                        </li>
                        <li>
                          <button
                            onClick={handleLogoutClick}
                            className="block w-full px-4 py-2 hover:bg-white/10 transition-colors duration-200"
                          >
                            Sair
                          </button>
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Button
                  label="Entrar"
                  onClick={handleLoginClick}
                  icon={<FaUser />}
                  className="hidden md:block mr-4"
                />
                <Button
                  label="Cadastrar"
                  onClick={handleRegisterClick}
                  icon={<FaPlus />}
                  className="hidden md:block"
                />
              </>
            )}
          </>
        )}
        <button className="md:hidden ml-4 z-10" onClick={toggleMenu}>
          {isMenuOpen ? (
            <FaTimes className="text-white text-xl" />
          ) : (
            <FaBars className="text-white text-xl" />
          )}
        </button>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-0 left-0 w-full h-screen bg-defaultBackgroundSecond pt-24 p-4"
          >
            <ul className="flex flex-col items-center text-center space-y-6">
              <NavItem href="/" label="Filmes" />
              <NavItem href="/series" label="Séries" />
              <div className="border-t border-gray-700 w-full my-4" />
              {isAuthenticated ? (
                <>
                  <li className="text-lg font-semibold text-white w-full">
                    <a className="block py-2">Assistidos</a>
                  </li>
                  <li className="text-lg font-semibold text-white w-full">
                    <a className="block py-2">Watchlist</a>
                  </li>
                  <Button
                    label="Sair"
                    onClick={handleLogoutClick}
                    className="w-full justify-center"
                  />
                </>
              ) : (
                <>
                  <Button
                    label="Entrar"
                    onClick={handleLoginClick}
                    icon={<FaUser />}
                    className="w-full justify-center"
                  />
                  <Button
                    label="Cadastrar"
                    onClick={handleRegisterClick}
                    icon={<FaPlus />}
                    className="w-full justify-center"
                  />
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-20 left-0 w-full bg-defaultBackgroundSecond p-4"
          >
            <SearchBar
              onFocus={() => setIsSearchExpanded(true)}
              onBlur={() => setIsSearchExpanded(false)}
              isExpanded={isSearchExpanded}
              isMobile={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Entrar">
        <FormLogin onClose={closeModal} />
      </Modal>

      <Modal
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
        title="Cadastrar"
      >
        <FormRegister onClose={closeRegisterModal} />
      </Modal>

      <ConfirmLogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </header>
  );
};

export default Header;
