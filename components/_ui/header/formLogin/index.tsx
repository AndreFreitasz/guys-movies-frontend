import { FaLock, FaUser } from "react-icons/fa";
import Input from "../../form/input";
import ButtonCancel from "../../form/buttonCancel";
import ButtonSubmit from "../../form/buttonSubmit";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";

interface FormLoginProps {
  email: string;
  password: string;
}

interface FormLoginComponentProps {
  onClose: () => void;
}

const schema = yup.object({
  email: yup
    .string()
    .email("O e-mail não é válido.")
    .required("O e-mail é obrigatório."),
  password: yup.string().required("A senha é obrigatória."),
});

const FormLogin = ({ onClose }: FormLoginComponentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormLoginProps>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormLoginProps) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Erro ao realizar login.");
        return;
      }
      toast.success("Login realizado com sucesso!");
      reset();
      onClose();
    } catch {
      console.error("Estamos com problemas, tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form
        className="flex flex-col space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input
          type="email"
          placeholder="E-mail"
          label="E-mail"
          icon={<FaUser className="text-gray-400" />}
          className="bg-gray-800 text-white"
          {...register("email")}
          error={errors.email?.message}
        />
        <Input
          type="password"
          placeholder="Senha"
          label="Senha"
          icon={<FaLock className="text-gray-400" />}
          className="bg-gray-800 text-white"
          {...register("password")}
          error={errors.password?.message}
        />
        <div className="flex justify-end">
          <ButtonCancel label="Cancelar" onClick={onClose} className="mr-4" />
          <ButtonSubmit label="Enviar" isLoading={isLoading} />
        </div>
      </form>
    </div>
  );
};

export default FormLogin;
