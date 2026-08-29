import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaEnvelope, FaLock, FaUser, FaAt } from "react-icons/fa";
import Input from "../../form/input";
import ButtonCancel from "../../form/buttonCancel";
import ButtonSubmit from "../../form/buttonSubmit";
import { toast } from "react-toastify";
import { useState } from "react";
import { useAuth } from "../../../../hooks/authContext";

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
    .min(8, "A senha deve conter no mínimo 8 caracteres.")
    .required("A senha é obrigatória."),
  confirmPassword: yup
    .string()
    .required("Confirme a sua senha.")
    .oneOf([yup.ref("password")], "As senhas devem ser iguais."),
});

const FormRegister = ({ onClose }: FormRegisterComponentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
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
      const { confirmPassword, ...payload } = data;
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Erro ao cadastrar um novo usuário.");
        return;
      }

      try {
        await login(data.email, data.password);
        toast.success(`Bem-vindo, ${data.name.split(" ")[0]}!`);
      } catch {
        toast.success(
          "Cadastro realizado! Entre com seu e-mail e senha para continuar.",
        );
      }

      reset();
      onClose();
    } catch {
      toast.error("Estamos com problemas, tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Input
        type="text"
        placeholder="Como podemos te chamar"
        label="Nome completo"
        autoComplete="name"
        icon={<FaUser size={14} />}
        {...register("name")}
        error={errors.name?.message}
      />
      <Input
        type="email"
        placeholder="voce@email.com"
        label="E-mail"
        autoComplete="email"
        icon={<FaEnvelope size={14} />}
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        type="text"
        placeholder="seuusuario"
        label="Nome de usuário"
        autoComplete="username"
        icon={<FaAt size={14} />}
        {...register("username")}
        error={errors.username?.message}
      />
      <Input
        type="password"
        placeholder="Mínimo de 8 caracteres"
        label="Senha"
        autoComplete="new-password"
        icon={<FaLock size={14} />}
        {...register("password")}
        error={errors.password?.message}
      />
      <Input
        type="password"
        placeholder="Repita a senha"
        label="Confirmar senha"
        autoComplete="new-password"
        icon={<FaLock size={14} />}
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />
      <div className="flex gap-3 pt-2">
        <ButtonCancel label="Cancelar" onClick={onClose} />
        <ButtonSubmit label="Criar conta" isLoading={isLoading} />
      </div>
    </form>
  );
};

export default FormRegister;
