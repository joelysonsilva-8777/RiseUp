import { type FunctionComponent, useEffect, useState } from "react";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { AppleMark, AuthLayout } from "../../components/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase/firebase";

const inputClassName =
  "h-[42px] w-full rounded-[9px] border-0 bg-white px-[13px] text-left text-[13px] leading-[16px] text-[#03557b] outline-none placeholder:text-[#03557b]";

const TelaLogin: FunctionComponent = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/");
    }
  }, [authLoading, navigate, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch {
      setErrorMessage("Não foi possível entrar. Verifique seu e-mail e senha.");
    } finally {
      setLoading(false);
    }
  };

  const recoverPassword = async () => {
    if (!email) {
      setErrorMessage("Digite seu e-mail antes de recuperar a senha.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setErrorMessage("Enviamos um link de recuperação para o seu e-mail.");
    } catch {
      setErrorMessage("Não foi possível enviar o link agora.");
    }
  };

  return (
    <AuthLayout firstToggleActive>
      <div className="flex w-full max-w-[360px] flex-col items-center text-center">
        <h1 className="mb-[24px] text-[34px] leading-[40px] text-white sm:text-[36px] sm:leading-[43px]">Entrar</h1>

        <form
          className="flex w-full max-w-[320px] flex-col rounded-[9px] bg-[#1d7b0c] px-[16px] pb-[17px] pt-[20px]"
          id="login-form"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-[10px] border-b border-white/80 pb-[17px] text-white">
            <button
              className="flex min-h-[34px] w-full items-center justify-between rounded-[7px] border border-white/25 bg-white/10 px-3 text-left text-[14px] leading-[18px] text-white transition-colors hover:bg-white/16"
              type="button"
            >
              <span>Fazer login com o iCloud</span>
              <span className="text-white">
                <AppleMark />
              </span>
            </button>
            <button
              className="flex min-h-[34px] w-full items-center justify-between rounded-[7px] border border-white/25 bg-white/10 px-3 text-left text-[14px] leading-[18px] text-white transition-colors hover:bg-white/16"
              type="button"
            >
              <span>Fazer login com o Google</span>
              <span className="text-[24px] leading-none">G</span>
            </button>
          </div>

          <div className="mt-[21px] flex flex-col gap-[10px]">
            <input
              className={inputClassName}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="E-mail"
              type="email"
              value={email}
            />
            <input
              className={inputClassName}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Senha"
              type="password"
              value={password}
            />
          </div>

          {errorMessage ? <p className="mt-[12px] text-[12px] leading-[16px] text-[#ffd7d7]">{errorMessage}</p> : null}

          <button
            className="mt-[10px] self-start bg-transparent p-0 text-left text-[11px] leading-[14px] text-white"
            onClick={() => void recoverPassword()}
            type="button"
          >
            Esqueci minha senha
          </button>
        </form>

        <button
          className="mt-[21px] h-[47px] w-[201px] rounded-[24px] border-0 bg-[#0d8c25] p-0 text-[22px] leading-[27px] text-white disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
          form="login-form"
          type="submit"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <Link className="mt-[12px] text-center text-[12px] leading-[15px] text-white no-underline" to="/cadastro">
          Não possui conta? clique aqui
        </Link>
      </div>
    </AuthLayout>
  );
};

export default TelaLogin;
