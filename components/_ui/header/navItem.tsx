// components/_ui/nav-item/index.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItemProps {
  href: string;
  label: string;
}

const NavItem = ({ href, label }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li className="relative group">
      <Link
        href={href}
        className="text-lg cursor-pointer transition duration-500 font-semibold text-white flex items-center"
      >
        {label}
        <div
          className={`absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-full h-1 rounded-md bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            isActive ? "opacity-100" : ""
          }`}
        ></div>
      </Link>
    </li>
  );
};

export default NavItem;
