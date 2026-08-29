import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { IconType } from "react-icons";
import {
  FaBookmark,
  FaFilm,
  FaSignOutAlt,
  FaTv,
  FaUserPlus,
  FaSignInAlt,
  FaEye,
  FaTimes,
} from "react-icons/fa";

interface MobileMenuUser {
  username: string;
  name: string;
  email: string;
}

interface MobileMenuProps {
  user: MobileMenuUser | null;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
}

interface MenuLink {
  href: string;
  label: string;
  description: string;
  icon: IconType;
}

const browseLinks: MenuLink[] = [
  {
    href: "/",
    label: "Filmes",
    description: "Populares, aclamados e por streaming",
    icon: FaFilm,
  },
  {
    href: "/series",
    label: "Séries",
    description: "O melhor de cada plataforma",
    icon: FaTv,
  },
];

const panelVariants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.32, 0.72, 0, 1] as const,
      staggerChildren: 0.05,
    },
  },
  exit: { opacity: 0, y: -16, transition: { duration: 0.22 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] as const },
  },
};

const getInitials = (value: string) =>
  value
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "U";

const MobileMenu = ({
  user,
  onClose,
  onLogin,
  onRegister,
  onLogout,
}: MobileMenuProps) => {
  const { pathname } = useRouter();

  const rowClass = (isActive: boolean) =>
    `flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 transition-all duration-300 ease-ios active:scale-[0.98] ${
      isActive
        ? "border-white/15 bg-white/[0.09]"
        : "border-transparent bg-white/[0.03] hover:bg-white/[0.06]"
    }`;

  const iconClass = (isActive: boolean) =>
    `flex h-10 w-10 items-center justify-center rounded-xl ${
      isActive ? "bg-white text-[#05050c]" : "bg-white/[0.06] text-white/55"
    }`;

  return (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-x-0 bottom-0 top-[4.25rem] z-40 overflow-y-auto overscroll-contain px-4 pb-32 pt-3 lg:hidden"
    >
      <div className="glass-strong rounded-4xl p-4 shadow-lift">
        <motion.div
          variants={itemVariants}
          className="mb-3 flex items-center justify-between px-1"
        >
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.25em] text-white/35">
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/60 transition-all duration-300 ease-ios active:scale-90"
          >
            <FaTimes size={13} />
          </button>
        </motion.div>

        <motion.div variants={itemVariants}>
          {user ? (
            <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/[0.05] p-[1px]">
              <div className="flex items-center gap-3 rounded-[calc(1.5rem-1px)] bg-[#0a0a16]/85 p-4 backdrop-blur-xl">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.1] text-sm font-black text-white">
                  {getInitials(user.username)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-emerald-300">
                      Conectado
                    </span>
                  </div>
                  <p className="mt-1 truncate text-base font-bold text-white">
                    {user.name || user.username}
                  </p>
                  <p className="truncate text-xs text-white/45">
                    @{user.username}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-white/40">
                <FaEye size={20} />
              </span>
              <p className="mt-3 text-base font-bold text-white">
                Você não está conectado
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/45">
                Entre para salvar o que já assistiu e dar notas aos filmes.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onLogin}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold tracking-tight text-[#05050c] transition-all duration-300 ease-ios active:scale-[0.96]"
                >
                  <FaSignInAlt size={13} />
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={onRegister}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm font-bold tracking-tight text-white transition-all duration-300 ease-ios hover:border-white/25 hover:bg-white/[0.11] active:scale-[0.96]"
                >
                  <FaUserPlus size={13} />
                  Criar conta
                </button>
              </div>
            </div>
          )}
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="px-2 pb-2 pt-6 text-[0.6rem] font-bold uppercase tracking-[0.25em] text-white/35"
        >
          Explorar
        </motion.p>

        <ul className="space-y-1.5">
          {browseLinks.map(({ href, label, description, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <motion.li key={href} variants={itemVariants}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={rowClass(isActive)}
                >
                  <span className={iconClass(isActive)}>
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.95rem] font-bold text-white">
                      {label}
                    </span>
                    <span className="block truncate text-xs text-white/40">
                      {description}
                    </span>
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ul>

        {user && (
          <>
            <motion.p
              variants={itemVariants}
              className="px-2 pb-2 pt-6 text-[0.6rem] font-bold uppercase tracking-[0.25em] text-white/35"
            >
              Sua conta
            </motion.p>
            <ul className="space-y-1.5">
              <motion.li variants={itemVariants}>
                <Link
                  href="/assistidos"
                  onClick={onClose}
                  className={rowClass(pathname === "/assistidos")}
                >
                  <span className={iconClass(pathname === "/assistidos")}>
                    <FaEye size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.95rem] font-bold text-white">
                      Assistidos
                    </span>
                    <span className="block truncate text-xs text-white/40">
                      Sua estante e suas notas
                    </span>
                  </span>
                </Link>
              </motion.li>
              <motion.li variants={itemVariants}>
                <span className="flex items-center gap-3.5 rounded-2xl border border-transparent bg-white/[0.02] px-4 py-3.5 opacity-60">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-white/35">
                    <FaBookmark size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.95rem] font-bold text-white/60">
                      Watchlist
                    </span>
                    <span className="block truncate text-xs text-white/30">
                      Em breve
                    </span>
                  </span>
                </span>
              </motion.li>
              <motion.li variants={itemVariants}>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-3.5 rounded-2xl border border-transparent bg-white/[0.03] px-4 py-3.5 text-left transition-all duration-300 ease-ios hover:bg-red-500/10 active:scale-[0.98]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-300">
                    <FaSignOutAlt size={15} />
                  </span>
                  <span className="text-[0.95rem] font-bold text-red-200">
                    Sair da conta
                  </span>
                </button>
              </motion.li>
            </ul>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MobileMenu;
