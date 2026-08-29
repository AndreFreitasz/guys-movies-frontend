import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { IconType } from "react-icons";
import {
  FaFilm,
  FaTv,
  FaSearch,
  FaUserCircle,
  FaSignInAlt,
} from "react-icons/fa";

interface MobileTabBarProps {
  isAuthenticated: boolean;
  isSearchOpen: boolean;
  isMenuOpen: boolean;
  onSearchClick: () => void;
  onAccountClick: () => void;
}

interface TabConfig {
  key: string;
  label: string;
  icon: IconType;
  href?: string;
  onClick?: () => void;
  isActive: boolean;
}

const MobileTabBar = ({
  isAuthenticated,
  isSearchOpen,
  isMenuOpen,
  onSearchClick,
  onAccountClick,
}: MobileTabBarProps) => {
  const { pathname } = useRouter();

  const tabs: TabConfig[] = [
    {
      key: "movies",
      label: "Filmes",
      icon: FaFilm,
      href: "/",
      isActive: pathname === "/" && !isSearchOpen && !isMenuOpen,
    },
    {
      key: "series",
      label: "Séries",
      icon: FaTv,
      href: "/series",
      isActive: pathname === "/series" && !isSearchOpen && !isMenuOpen,
    },
    {
      key: "search",
      label: "Buscar",
      icon: FaSearch,
      onClick: onSearchClick,
      isActive: isSearchOpen,
    },
    {
      key: "account",
      label: isAuthenticated ? "Conta" : "Entrar",
      icon: isAuthenticated ? FaUserCircle : FaSignInAlt,
      onClick: onAccountClick,
      isActive: isMenuOpen || pathname === "/assistidos",
    },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
      <motion.nav
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1], delay: 0.15 }}
        className="glass-strong pointer-events-auto flex w-full max-w-sm items-center justify-around rounded-[1.75rem] px-2 py-2 shadow-lift"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;

          const content = (
            <>
              {tab.isActive && (
                <motion.span
                  layoutId="tab-bar-indicator"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-2xl bg-white/[0.1] ring-1 ring-white/10"
                />
              )}
              <span className="relative z-10 flex flex-col items-center gap-1">
                <Icon
                  size={17}
                  className={
                    tab.isActive
                      ? "text-indigo-300 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]"
                      : "text-white/45"
                  }
                />
                <span
                  className={`text-[0.6rem] font-bold tracking-wide ${
                    tab.isActive ? "text-white" : "text-white/45"
                  }`}
                >
                  {tab.label}
                </span>
              </span>
            </>
          );

          const baseClass =
            "relative flex flex-1 flex-col items-center justify-center rounded-2xl px-2 py-2 transition-transform duration-300 ease-ios active:scale-90";

          if (tab.href) {
            return (
              <Link key={tab.key} href={tab.href} className={baseClass}>
                {content}
              </Link>
            );
          }

          return (
            <button
              key={tab.key}
              type="button"
              onClick={tab.onClick}
              className={baseClass}
            >
              {content}
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
};

export default MobileTabBar;
