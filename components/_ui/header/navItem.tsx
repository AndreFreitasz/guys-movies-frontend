import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

interface NavItemProps {
  href: string;
  label: string;
  onNavigate?: () => void;
  layoutGroup?: string;
}

const NavItem = ({
  href,
  label,
  onNavigate,
  layoutGroup = "desktop",
}: NavItemProps) => {
  const { pathname } = useRouter();
  const isActive = pathname === href;

  return (
    <li className="relative">
      <Link
        href={href}
        onClick={onNavigate}
        className={`relative flex items-center rounded-full px-4 py-2 text-[0.95rem] font-semibold transition-colors duration-300 ${
          isActive ? "text-white" : "text-white/55 hover:text-white"
        }`}
      >
        {isActive && (
          <motion.span
            layoutId={`nav-pill-${layoutGroup}`}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/15"
          />
        )}
        <span className="relative z-10">{label}</span>
      </Link>
    </li>
  );
};

export default NavItem;
