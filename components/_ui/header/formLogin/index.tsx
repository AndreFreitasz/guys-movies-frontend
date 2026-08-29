import { FaLock, FaEnvelope } from "react-icons/fa";
import Input from "../../form/input";
import ButtonCancel from "../../form/buttonCancel";
import ButtonSubmit from "../../form/buttonSubmit";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useAuth } from "../../../../hooks/authContext";

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
  const { login } = useAuth();
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
      await login(data.email, data.password);
      toast.success("Login realizado com sucesso!");
      reset();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao realizar login.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
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
        type="password"
        placeholder="Sua senha"
        label="Senha"
        autoComplete="current-password"
        icon={<FaLock size={14} />}
        {...register("password")}
        error={errors.password?.message}
      />
      <div className="flex gap-3 pt-2">
        <ButtonCancel label="Cancelar" onClick={onClose} />
        <ButtonSubmit label="Entrar" isLoading={isLoading} />
      </div>
    </form>
  );
};

export default FormLogin;
