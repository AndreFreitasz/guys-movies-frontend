import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import {
  FaSignInAlt,
  FaUserPlus,
  FaEye,
  FaBookmark,
  FaSignOutAlt,
} from "react-icons/fa";

import NavItem from "./navItem";
import UserChip from "./userChip";
import MobileMenu from "./mobileMenu";
import Modal from "../modal";
import SearchBar from "../searchBar";
import FormRegister from "./formRegister";
import FormLogin from "./formLogin";
import ConfirmLogoutModal from "../modal/confirmLogoutModal";
import MobileTabBar from "../mobileTabBar";
import { useAuth } from "../../../hooks/authContext";

const SCROLL_THRESHOLD = 12;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();
  const { isAuthenticated, user, authLoading, logout } = useAuth();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > SCROLL_THRESHOLD);
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (chipRef.current?.contains(target)) return;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    if (!isDropdownOpen) return;

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  useEffect(() => {
    const shouldLock = isMenuOpen || isMobileSearchOpen;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, isMobileSearchOpen]);

  useEffect(() => {
    const closeOverlays = () => {
      setIsMenuOpen(false);
      setIsMobileSearchOpen(false);
      setIsDropdownOpen(false);
    };

    router.events.on("routeChangeStart", closeOverlays);
    return () => router.events.off("routeChangeStart", closeOverlays);
  }, [router.events]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsMenuOpen(false);
      setIsMobileSearchOpen(false);
      setIsDropdownOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const openLogin = useCallback(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    setIsLoginModalOpen(true);
  }, []);

  const openRegister = useCallback(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    setIsRegisterModalOpen(true);
  }, []);

  const openLogoutConfirm = useCallback(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    setIsLogoutModalOpen(true);
  }, []);

  const toggleMobileSearch = () => {
    setIsMenuOpen(false);
    setIsMobileSearchOpen((previous) => !previous);
  };

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  const handleMobileAccountClick = () => {
    if (isAuthenticated) {
      setIsMenuOpen((previous) => !previous);
      setIsMobileSearchOpen(false);
      return;
    }
    openLogin();
  };

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-ios ${
          isScrolled || isMenuOpen || isMobileSearchOpen
            ? "border-b border-white/[0.07] bg-[#05050c]/80 backdrop-blur-2xl backdrop-saturate-150"
            : "border-b border-transparent bg-gradient-to-b from-[#05050c]/90 to-transparent"
        }`}
      >
        <div className="mx-auto flex h-[4.25rem] w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:h-20 lg:gap-6 lg:px-10 xl:px-14">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-0.5"
            aria-label="Página inicial"
          >
            <span className="brand-text text-xl font-black tracking-tight sm:text-2xl lg:text-[1.75rem]">
              GUY&apos;S
            </span>
            <span className="text-xl font-black tracking-tight text-white sm:text-2xl lg:text-[1.75rem]">
              Filmes
            </span>
          </Link>

          <nav className="hidden lg:block">
            <ul className="flex items-center gap-1">
              <NavItem href="/" label="Filmes" />
              <NavItem href="/series" label="Séries" />
              {isAuthenticated && (
                <NavItem href="/assistidos" label="Assistidos" />
              )}
            </ul>
          </nav>

          <div className="ml-auto hidden min-w-0 flex-1 justify-end lg:flex">
            <div className="w-full max-w-md">
              <SearchBar
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                isExpanded={isSearchFocused}
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            {authLoading ? (
              <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.06] lg:w-32" />
            ) : isAuthenticated && user ? (
              <>
                <div className="relative hidden lg:block" ref={dropdownRef}>
                  <UserChip
                    ref={chipRef}
                    username={user.username}
                    isOpen={isDropdownOpen}
                    onClick={() => setIsDropdownOpen((previous) => !previous)}
                  />
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{
                          duration: 0.28,
                          ease: [0.32, 0.72, 0, 1],
                        }}
                        className="glass-strong absolute right-0 mt-3 w-64 origin-top-right overflow-hidden rounded-3xl p-2 shadow-lift"
                      >
                        <div className="rounded-2xl bg-white/[0.04] px-4 py-3">
                          <p className="truncate text-sm font-bold text-white">
                            {user.name || user.username}
                          </p>
                          <p className="truncate text-xs text-white/45">
                            {user.email}
                          </p>
                        </div>
                        <ul className="mt-1.5 space-y-0.5">
                          <li>
                            <Link
                              href="/assistidos"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white/80 transition-colors duration-200 hover:bg-white/[0.07] hover:text-white"
                            >
                              <FaEye size={14} className="text-indigo-300" />
                              Assistidos
                            </Link>
                          </li>
                          <li>
                            <span className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white/30">
                              <FaBookmark size={13} />
                              Watchlist
                              <span className="ml-auto rounded-full bg-white/[0.07] px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider">
                                em breve
                              </span>
                            </span>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={openLogoutConfirm}
                              className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-red-200 transition-colors duration-200 hover:bg-red-500/10"
                            >
                              <FaSignOutAlt size={13} />
                              Sair
                            </button>
                          </li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={handleMobileAccountClick}
                  aria-label={`Conta de ${user.username}`}
                  className="relative flex h-10 items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 pl-1 pr-3 transition-all duration-300 ease-ios active:scale-95 lg:hidden"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.1] text-[0.65rem] font-black text-white">
                    {user.username.slice(0, 2).toUpperCase()}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#05050c] bg-emerald-400" />
                  </span>
                  <span className="hidden max-w-[7rem] truncate text-xs font-bold text-emerald-100 min-[380px]:inline">
                    @{user.username}
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openLogin}
                  className="hidden h-10 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-5 text-sm font-bold tracking-tight text-white transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.11] active:translate-y-0 active:scale-[0.96] lg:flex"
                >
                  <FaSignInAlt size={13} />
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={openRegister}
                  className="group hidden h-10 items-center gap-2 rounded-full px-5 text-sm font-bold tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)] active:translate-y-0 active:scale-[0.96] lg:flex"
                >
                  <FaUserPlus size={13} />
                  Cadastrar
                </button>

                <button
                  type="button"
                  onClick={openLogin}
                  className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-bold tracking-tight text-[#05050c] transition-all duration-300 ease-ios active:scale-[0.94] lg:hidden"
                >
                  <FaSignInAlt size={12} />
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="border-t border-white/[0.06] bg-[#05050c]/95 px-4 pb-4 pt-3 backdrop-blur-2xl lg:hidden"
            >
              <SearchBar
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                isExpanded
                isMobile
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <MobileMenu
              user={user}
              onClose={() => setIsMenuOpen(false)}
              onLogin={openLogin}
              onRegister={openRegister}
              onLogout={openLogoutConfirm}
            />
          </>
        )}
      </AnimatePresence>

      <div className="h-[4.25rem] lg:h-20" />

      <MobileTabBar
        isAuthenticated={isAuthenticated}
        onSearchClick={toggleMobileSearch}
        onAccountClick={handleMobileAccountClick}
        isSearchOpen={isMobileSearchOpen}
        isMenuOpen={isMenuOpen}
      />

      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Bem-vindo de volta"
        subtitle="Entre para continuar de onde você parou."
      >
        <FormLogin onClose={() => setIsLoginModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Criar sua conta"
        subtitle="Leva menos de um minuto."
      >
        <FormRegister onClose={() => setIsRegisterModalOpen(false)} />
      </Modal>

      <ConfirmLogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default Header;
