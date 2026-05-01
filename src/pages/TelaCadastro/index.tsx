import { type FunctionComponent, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { AppleMark, AuthLayout } from "../../components/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { auth, firestore } from "../../firebase/firebase";

const SelectField = ({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) => (
  <label className="relative block">
    <select
      id={id}
      className="h-[42px] w-full appearance-none rounded-[9px] border-0 bg-white px-[13px] pr-10 text-left text-[13px] leading-[16px] text-[#333] outline-none"
      onChange={(event) => onChange(event.target.value)}
      required
      value={value}
    >
      <option disabled value="">
        {label}
      </option>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
    <svg
      className="pointer-events-none absolute right-[13px] top-1/2 -translate-y-1/2"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="#111"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  </label>
);

const TelaCadastro: FunctionComponent = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [disabilityType, setDisabilityType] = useState("");
  const [preferredActivity, setPreferredActivity] = useState("");
  const [accountType, setAccountType] = useState<"Empresa" | "Usuário" | "">("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/");
    }
  }, [authLoading, navigate, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accountType) {
      setErrorMessage("Selecione se a conta será de empresa ou usuário.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(credential.user, {
        displayName: fullName,
      });

      await setDoc(
        doc(firestore, "users", credential.user.uid),
        {
          fullName,
          email,
          disabilityType,
          preferredActivity,
          accountType,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      navigate("/");
    } catch {
      setErrorMessage("Não foi possível criar a conta agora. Confira os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex w-full max-w-[360px] flex-col items-center text-center">
        <h1 className="mb-[27px] text-[36px] leading-[43px] text-white">Cadastrar</h1>

        <form
          className="flex w-[320px] flex-col rounded-[9px] bg-[#1d7b0c] px-[16px] pb-[22px] pt-[22px]"
          id="cadastro-form"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-[13px] border-b border-white/80 pb-[17px] text-white">
            <button
              className="flex h-[22px] w-full items-center justify-between border-0 bg-transparent p-0 text-left text-[16px] leading-[19px] text-white"
              type="button"
            >
              <span>Fazer login com o iCloud</span>
              <span className="text-white">
                <AppleMark />
              </span>
            </button>
            <button
              className="flex h-[22px] w-full items-center justify-between border-0 bg-transparent p-0 text-left text-[16px] leading-[19px] text-white"
              type="button"
            >
              <span>Fazer login com o Google</span>
              <span className="text-[30px] leading-none">G</span>
            </button>
          </div>

          <div className="mt-[21px] flex flex-col gap-[8px]">
            <input
              className="h-[42px] w-full rounded-[9px] border-0 bg-white px-[13px] text-left text-[13px] leading-[16px] text-[#03557b] outline-none placeholder:text-[#03557b]"
              autoComplete="name"
              onChange={(event) => setFullName(event.target.value)}
              required
              placeholder="Nome completo"
              type="text"
              value={fullName}
            />
            <input
              className="h-[42px] w-full rounded-[9px] border-0 bg-white px-[13px] text-left text-[13px] leading-[16px] text-[#03557b] outline-none placeholder:text-[#03557b]"
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="E-mail"
              type="email"
              value={email}
            />
            <input
              className="h-[42px] w-full rounded-[9px] border-0 bg-white px-[13px] text-left text-[13px] leading-[16px] text-[#03557b] outline-none placeholder:text-[#03557b]"
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Senha"
              type="password"
              value={password}
            />
            <SelectField
              id="disability-type"
              label="Selecione seu tipo de deficiência"
              onChange={setDisabilityType}
              options={["Visual", "Auditiva", "Motora", "Cognitiva"]}
              value={disabilityType}
            />
            <SelectField
              id="preferred-activity"
              label="Selecione suas atividades preferidas"
              onChange={setPreferredActivity}
              options={["Tecnologia", "Moda", "Casa", "Esportes"]}
              value={preferredActivity}
            />
          </div>

          <fieldset className="mt-[16px] border-0 p-0 text-left text-white">
            <legend className="mb-[11px] p-0 text-[13px] leading-[16px]">
              Você é empresa ou usuário?
            </legend>
            <div className="flex gap-[17px]">
              <label className="flex items-center gap-[8px] text-[13px] leading-[16px]">
                <input
                  checked={accountType === "Empresa"}
                  className="h-[13px] w-[13px] accent-white"
                  name="tipo"
                  onChange={() => setAccountType("Empresa")}
                  type="radio"
                />
                Empresa
              </label>
              <label className="flex items-center gap-[8px] text-[13px] leading-[16px]">
                <input
                  checked={accountType === "Usuário"}
                  className="h-[13px] w-[13px] accent-white"
                  name="tipo"
                  onChange={() => setAccountType("Usuário")}
                  type="radio"
                />
                Usuário
              </label>
            </div>
          </fieldset>

          {errorMessage ? (
            <p className="mt-[12px] text-[12px] leading-[16px] text-[#ffd7d7]">{errorMessage}</p>
          ) : null}
        </form>

        <button
          className="mt-[21px] h-[47px] w-[201px] rounded-[24px] border-0 bg-[#0d8c25] p-0 text-[22px] leading-[27px] text-white disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
          form="cadastro-form"
          type="submit"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>

        <Link className="mt-[12px] text-center text-[12px] leading-[15px] text-white no-underline" to="/login">
          Já possui conta? clique aqui
        </Link>
      </div>
    </AuthLayout>
  );
};

export default TelaCadastro;
