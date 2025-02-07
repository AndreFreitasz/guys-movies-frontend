import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Input from "../../form/input";
import ButtonCancel from "../../form/buttonCancel";
import ButtonSubmit from "../../form/buttonSubmit";
import { toast } from "react-toastify";
import { useState } from "react";

interface FormRegisterProps {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface FormRegisterComponentProps {
  onClose: () => void;
}

const schema = yup.object({
  name: yup.string().required("O nome é obrigatório."),
  email: yup
    .string()
    .email("O e-mail não é válido.")
    .required("O e-mail é obrigatório."),
  username: yup.string().required("O nome de usuário é obrigatório."),
  password: yup
    .string()
    .min(6, "A senha deve conter no mínimo 6 caracteres.")
    .required("A senha é obrigatória."),
  confirmPassword: yup
    .string()
    .required("Confirme a sua senha.")
    .oneOf([yup.ref("password")], "As senhas devem ser iguais."),
});

const FormRegister = ({ onClose }: FormRegisterComponentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormRegisterProps>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormRegisterProps) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Erro ao cadastrar um novo usuário.");
        return;
      }
      toast.success("Cadastro realizado com sucesso!");
      reset();
      onClose();
    } catch {
      toast.error("Estamos com problemas, tente novamente mais tarde.");
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
          type="text"
          placeholder="Nome Completo"
          label="Nome Completo"
          className="bg-gray-800 text-white"
          {...register("name")}
          error={errors.name?.message}
        />
        <Input
          type="email"
          placeholder="E-mail"
          label="E-mail"
          className="bg-gray-800 text-white"
          {...register("email")}
          error={errors.email?.message}
        />
        <Input
          type="text"
          placeholder="Nome de usuário"
          label="Nome de usuário"
          className="bg-gray-800 text-white"
          {...register("username")}
          error={errors.username?.message}
        />
        <Input
          type="password"
          placeholder="Senha"
          label="Senha"
          className="bg-gray-800 text-white"
          {...register("password")}
          error={errors.password?.message}
        />
        <Input
          type="password"
          placeholder="Confirmar senha"
          label="Confirmar senha"
          className="bg-gray-800 text-white"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
        <div className="flex justify-end">
          <ButtonCancel label="Cancelar" onClick={onClose} className="mr-4" />
          <ButtonSubmit label="Cadastrar" isLoading={isLoading} />
        </div>
      </form>
    </div>
  );
};

export default FormRegister;
