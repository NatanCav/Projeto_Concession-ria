import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigate, useLocation, useNavigate, type Location } from "react-router-dom";
import { Car } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { extractErrorMessage } from "@/services/apiClient";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const loginSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function AdminLogin() {
  useDocumentMeta({ title: "Login administrativo — Concessionária" });

  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? "/admin";
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(values);
      navigate("/admin");
    } catch (error) {
      toast.error(extractErrorMessage(error, "E-mail ou senha inválidos."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-popover">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Car className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-bold text-ink-900">Painel administrativo</h1>
          <p className="text-sm text-ink-500">Entre com suas credenciais para continuar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="E-mail"
            type="email"
            autoComplete="username"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" isLoading={isSubmitting} className="mt-2">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
