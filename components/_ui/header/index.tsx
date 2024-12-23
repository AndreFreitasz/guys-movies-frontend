import React, { useState } from "react";
import NavItem from "./navItem";
import Button from "../button";
import { FaUser, FaBars, FaTimes, FaLock, FaPlus } from "react-icons/fa";
import Modal from "../modal";
import Input from "../form/input";
import ButtonSubmit from "../form/buttonSubmit";
import ButtonCancel from "../form/buttonCancel";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

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

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Entrar">
        <div>
          <form className="flex flex-col space-y-6">
            <Input
              type="email"
              placeholder="E-mail"
              label="E-mail"
              icon={<FaUser className="text-gray-400" />}
              className="bg-gray-800 text-white"
            />
            <Input
              type="password"
              placeholder="Senha"
              label="Senha"
              icon={<FaLock className="text-gray-400" />}
              className="bg-gray-800 text-white"
            />
          </form>
          <div className="flex justify-end">
            <ButtonCancel
              label="Cancelar"
              onClick={closeModal}
              className="mr-4"
            />
            <ButtonSubmit
              label="Enviar"
              onClick={() => console.log("Botão clicado")}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
        title="Cadastrar"
      >
        <div>
          <form className="flex flex-col space-y-6">
            <Input
              type="email"
              placeholder="E-mail"
              label="E-mail"
              icon={<FaUser className="text-gray-400" />}
              className="bg-gray-800 text-white"
            />
            <Input
              type="text"
              placeholder="Nome de usuário"
              label="Nome de usuário"
              icon={<FaUser className="text-gray-400" />}
              className="bg-gray-800 text-white"
            />
            <Input
              type="password"
              placeholder="Senha"
              label="Senha"
              icon={<FaLock className="text-gray-400" />}
              className="bg-gray-800 text-white"
            />
            <Input
              type="password"
              placeholder="Confirmar senha"
              label="Confirmar senha"
              icon={<FaLock className="text-gray-400" />}
              className="bg-gray-800 text-white"
            />
          </form>
          <div className="flex justify-end">
            <ButtonCancel
              label="Cancelar"
              onClick={closeRegisterModal}
              className="mr-4"
            />
            <ButtonSubmit
              label="Cadastrar"
              onClick={() => console.log("Botão clicado")}
            />
          </div>
        </div>
      </Modal>
    </header>
  );
};

export default Header;
