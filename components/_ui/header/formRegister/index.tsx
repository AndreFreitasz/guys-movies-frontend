import { FaLock, FaUser } from "react-icons/fa";
import Input from "../../form/input";
import ButtonCancel from "../../form/buttonCancel";
import ButtonSubmit from "../../form/buttonSubmit";
import { useState } from "react";

const FormRegister = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
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
        <ButtonCancel label="Cancelar" onClick={closeModal} className="mr-4" />
        <ButtonSubmit
          label="Cadastrar"
          onClick={() => console.log("Botão clicado")}
        />
      </div>
    </div>
  );
};

export default FormRegister;
