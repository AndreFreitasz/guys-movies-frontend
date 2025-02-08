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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLoginClick = () => setIsModalOpen(true);

  const handleRegisterClick = () => setIsRegisterModalOpen(true);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const closeModal = () => setIsModalOpen(false);

  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  const handleSearchFocus = () => setIsSearchExpanded(true);

  const handleSearchBlur = () => setIsSearchExpanded(false);

  const toggleSearchBar = () => setIsSearchVisible(!isSearchVisible);

  const handleLogoutClick = () => setIsLogoutModalOpen(true);

  const toggleDropdown = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  return (
    <header className="h-20 flex items-center justify-between py-4 px-6 md:py-12 md:px-40 w-full">
      <div className="flex items-center">
        <div className="flex items-center ml-2">
          <p className="font-extrabold text-indigo-600 text-3xl md:text-5xl">
            GUY'S
          </p>
          <p className="font-extrabold text-white text-3xl md:text-5xl ml-1">
            Filmes
          </p>
        </div>
      </div>

      <div className="flex-grow flex justify-start ml-6">
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
                {isDropdownOpen && (
                  <AnimatePresence>
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
                  </AnimatePresence>
                )}
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
        <button className="md:hidden ml-4" onClick={toggleMenu}>
          {isMenuOpen ? (
            <FaTimes className="text-white text-xl" />
          ) : (
            <FaBars className="text-white text-xl" />
          )}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-defaultBackgroundSecond p-4">
          <ul className="flex flex-col space-y-4">
            <NavItem href="/" label="Filmes" />
            <NavItem href="/series" label="Séries" />
            <Button
              label="Entrar"
              onClick={handleLoginClick}
              icon={<FaUser />}
            />
            <Button
              label="Cadastrar"
              onClick={handleRegisterClick}
              icon={<FaPlus />}
            />
          </ul>
        </div>
      )}

      {isSearchVisible && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-defaultBackgroundSecond p-4">
          <SearchBar
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            isExpanded={isSearchExpanded}
          />
        </div>
      )}

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