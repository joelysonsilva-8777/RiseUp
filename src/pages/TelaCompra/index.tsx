import { FunctionComponent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppHeader } from "../../components/AppHeader";
import { useAuth } from "../../context/AuthContext";

const TelaCompra: FunctionComponent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<"endereco" | "pagamento" | "confirmacao">("endereco");
  const [loading, setLoading] = useState(false);

  // Simulação de itens do carrinho (depois você pode pegar do contexto)
  const cartItems = [
    { name: "Cadeira motorizada com navegação inteligente", price: 11900, qty: 1 },
    { name: "Interface háptica para navegação tátil", price: 6700, qty: 1 },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const frete = 250;
  const total = subtotal + frete;

  const handleFinalizarCompra = async () => {
    setLoading(true);
    // Aqui você pode integrar com pagamento (Mercado Pago, Stripe, etc.)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStep("confirmacao");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3] font-['Montserrat',sans-serif] text-[#071735]">
      <AppHeader />

      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
        <h1 className="mb-8 text-3xl font-semibold text-[#071735]">Finalizar Compra</h1>

        {/* Progresso */}
        <div className="mb-10 flex justify-center">
          <div className="flex w-full max-w-md items-center justify-between">
            {["Endereço", "Pagamento", "Confirmação"].map((label, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${step === ["endereco","pagamento","confirmacao"][index] ? "border-[#257a0d] bg-[#257a0d] text-white" : "border-gray-300"}`}>
                  {index + 1}
                </div>
                <span className="mt-2 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Formulário */}
          <div className="lg:col-span-3">
            {step === "endereco" && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-2xl font-medium">Endereço de Entrega</h2>
                {/* Formulário de endereço aqui */}
                <button
                  onClick={() => setStep("pagamento")}
                  className="mt-6 w-full rounded-xl bg-[#257a0d] py-4 text-white font-medium hover:bg-[#1e5f0a] transition-colors"
                >
                  Continuar para Pagamento
                </button>
              </div>
            )}

            {step === "pagamento" && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-2xl font-medium">Forma de Pagamento</h2>
                <p className="text-gray-600">Escolha a forma de pagamento (Pix, Cartão, Boleto...)</p>
                
                <button
                  onClick={handleFinalizarCompra}
                  disabled={loading}
                  className="mt-8 w-full rounded-xl bg-[#257a0d] py-4 text-white font-medium hover:bg-[#1e5f0a] disabled:opacity-70 transition-colors"
                >
                  {loading ? "Processando..." : "Finalizar Compra"}
                </button>
              </div>
            )}

            {step === "confirmacao" && (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                  ✅
                </div>
                <h2 className="text-3xl font-semibold text-[#257a0d]">Compra Realizada com Sucesso!</h2>
                <p className="mt-4 text-lg text-gray-600">Obrigado por comprar na Acesse+.</p>
                
                <div className="mt-10 space-x-4">
                  <button
                    onClick={() => navigate("/")}
                    className="rounded-xl border border-[#257a0d] px-8 py-3 text-[#257a0d] hover:bg-[#257a0d] hover:text-white transition-colors"
                  >
                    Voltar para Início
                  </button>
                  <button
                    onClick={() => navigate("/perfil")}
                    className="rounded-xl bg-[#257a0d] px-8 py-3 text-white hover:bg-[#1e5f0a]"
                  >
                    Ver Meus Pedidos
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-5 text-xl font-medium">Resumo do Pedido</h3>
              
              {cartItems.map((item, i) => (
                <div key={i} className="flex justify-between border-b py-4 text-sm">
                  <div>
                    <p>{item.name}</p>
                    <p className="text-gray-500">Qtd: {item.qty}</p>
                  </div>
                  <p className="font-medium">R$ {(item.price * item.qty).toLocaleString('pt-BR')}</p>
                </div>
              ))}

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>R$ {frete.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between border-t pt-4 text-base font-semibold">
                  <span>Total</span>
                  <span>R$ {total.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TelaCompra;