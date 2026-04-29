import { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import Inicial from "./pages/Inicial";
import TelaCarrinho from "./pages/TelaCarrinho";
import TelaCadastro from "./pages/TelaCadastro";
import TelaLogin from "./pages/TelaLogin";
import TelaProduto from "./pages/TelaProduto";
import TelaPerfil from "./pages/TelaPerfil";

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  useEffect(() => {
    let title = "";
    let metaDescription = "";

    switch (pathname) {
      case "/":
        title = "";
        metaDescription = "";
        break;
      case "/login":
        title = "";
        metaDescription = "";
        break;
      case "/cadastro":
        title = "";
        metaDescription = "";
        break;
      case "/registro":
        title = "";
        metaDescription = "";
        break;
      case "/produto":
      case "/carrinho":
      case "/carrinho/endereco":
      case "/carrinho/entrega":
        title = "";
        metaDescription = "";
        break;
    }

    if (title) {
      document.title = title;
    }

    if (metaDescription) {
      const metaDescriptionTag: HTMLMetaElement | null = document.querySelector(
        'head > meta[name="description"]'
      );
      if (metaDescriptionTag) {
        metaDescriptionTag.content = metaDescription;
      }
    }
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<Inicial />} />
      <Route path="/login" element={<TelaLogin />} />
      <Route path="/cadastro" element={<TelaCadastro />} />
      <Route path="/registro" element={<TelaCadastro />} />
      <Route path="/produto" element={<TelaProduto />} />
      <Route path="/perfil" element={<TelaPerfil />} />
      <Route path="/carrinho" element={<TelaCarrinho />} />
      <Route path="/carrinho/endereco" element={<TelaCarrinho step="address" />} />
      <Route path="/carrinho/entrega" element={<TelaCarrinho step="delivery" />} />
    </Routes>
  );
}
export default App;
