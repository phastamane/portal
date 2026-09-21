import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/entities/auth/auth-api";
import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submit, setSubmiting] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [error]);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown(false), 2000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleSumbit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmiting(true);

    try {
      const fd = new FormData(e.currentTarget);
      const username = String(fd.get("username") ?? "");
      const password = String(fd.get("password") ?? "");
      const ok = await authApi({ username, password });
      if (!ok) {
        setError("Неверный логин или пароль");
        setCooldown(true);
        return;
      }
      navigate({ to: "/" });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось войти");
    } finally {
      setSubmiting(false);
    }
  };
  return (
    <div className="flex flex-col gap-2 w-full">
      <form
        className="flex flex-col gap-2 max-w-lg mx-auto"
        onSubmit={handleSumbit}
      >
        <h1 className="font-semibold text-2xl mx-auto">Авторизация</h1>
        <Input name="username" autoComplete="username" />
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer absolute right-1 hover:bg-transparent"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>
        <Button
          className={"cursor-pointer"}
          type={"submit"}
          disabled={submit || cooldown}
        >
          {submit ? <Spinner /> : "Войти"}
        </Button>
      </form>
      {error && (
        <Alert
          className="absolute max-w-sm bottom-5 right-5 bg-red-100 font-bold"
          variant={"destructive"}
        >
          {error}
        </Alert>
      )}
    </div>
  );
}

export default LoginForm;
