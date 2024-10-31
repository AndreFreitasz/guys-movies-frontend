// components/_ui/header/index.tsx
import Image from "next/image";
import NavItem from "./navItem";

const Header = () => {
  return (
    <header className="h-20 flex items-center justify-between px-40 w-full">
      <div className="flex items-center">
        <div className="flex items-center ml-2">
          <p className="font-extrabold text-red-500 text-5xl">GUY'S</p>
          <p className="font-extrabold text-white text-5xl ml-1">Movies</p>
        </div>
      </div>

      <nav>
        <ul className="flex space-x-8">
          <NavItem href="/" label="Movies" />
          <NavItem href="/series" label="Séries" />
        </ul>
      </nav>
    </header>
  );
};

export default Header;
