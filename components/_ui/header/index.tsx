import React, { useState } from "react";
import NavItem from "./navItem";
import Button from "../button";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClick = () => {
    alert("Button clicked!");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="h-20 flex items-center justify-between py-4 px-6 md:py-12 md:px-40 w-full">
      <div className="flex items-center">
        <div className="flex items-center ml-2">
          <p className="font-extrabold text-indigo-600 text-3xl md:text-5xl">
            GUY'S
          </p>
          <p className="font-extrabold text-white text-3xl md:text-5xl ml-1">
            Movies
          </p>
        </div>
      </div>

      <nav className="flex flex-row items-center">
        <ul className="hidden md:flex space-x-8 mr-12">
          <NavItem href="/" label="Movies" />
          <NavItem href="/series" label="Séries" />
        </ul>
        <Button
          label="Entrar"
          onClick={handleClick}
          icon={<FaUser />}
          className="hidden md:block"
        />
        <button className="md:hidden ml-4" onClick={toggleMenu}>
          {isMenuOpen ? (
            <FaTimes className="text-white" />
          ) : (
            <FaBars className="text-white" />
          )}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-defaultBackgroundSecond p-4">
          <ul className="flex flex-col space-y-4">
            <NavItem href="/" label="Movies" />
            <NavItem href="/series" label="Séries" />
            <Button label="Entrar" onClick={handleClick} icon={<FaUser />} />
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
