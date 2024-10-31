import NavItem from "./navItem";
import Button from "../button";
import { FaUser } from "react-icons/fa";

const Header = () => {
  const handleClick = () => {
    alert("Button clicked!");
  };

  return (
    <header className="h-20 flex items-center justify-between py-12 px-40 w-full">
      <div className="flex items-center">
        <div className="flex items-center ml-2">
          <p className="font-extrabold text-indigo-600 text-5xl">GUY'S</p>
          <p className="font-extrabold text-white text-5xl ml-1">Movies</p>
        </div>
      </div>

      <nav className="flex flex-row items-center">
        <ul className="flex space-x-8 mr-12">
          <NavItem href="/" label="Movies" />
          <NavItem href="/series" label="Séries" />
        </ul>
        <Button label="Entrar" onClick={handleClick} icon={<FaUser />} />
      </nav>
    </header>
  );
};

export default Header;
