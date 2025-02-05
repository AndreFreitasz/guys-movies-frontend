import React, { useState } from "react";
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

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const { isAuthenticated, user, loading, logout } = useAuth();

  const handleLoginClick = () => {
    setIsModalOpen(true);
  };

  const handleRegisterClick = () => {
    setIsRegisterModalOpen(true);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  const handleSearchFocus = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchBlur = () => {
    setIsSearchExpanded(false);
  };

  const toggleSearchBar = () => {
    setIsSearchVisible(!isSearchVisible);
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
        {!isSearchExpanded && (
          <>
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={logout}
                  className="hidden md:flex items-center text-white"
                >
                  {user?.username} <FaCaretDown className="ml-2" />
                </button>
                {/* {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <ul className="py-1">
                      <li>
                        <a
                          href="/assistidos"
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                        >
                          Assistidos
                        </a>
                      </li>
                      <li>
                        <a
                          href="/watchlist"
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                        >
                          Watchlist
                        </a>
                      </li>
                      <li>
                        <button
                          onClick={logout}
                          className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                        >
                          Sair
                        </button>
                      </li>
                    </ul>
                  </div>
                )} */}
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
    </header>
  );
};

export default Header;
