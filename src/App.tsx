import { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import Inicial from "./pages/Inicial/index";
import TelaCarrinho from "./pages/TelaCarrinho/index";
import TelaCadastro from "./pages/TelaCadastro/index";
import TelaLogin from "./pages/TelaLogin/index";
import TelaProduto from "./pages/TelaProduto/index";
import TelaPerfil from "./pages/TelaPerfil/index";

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;
  const hash = location.hash;

  useEffect(() => {
    if (action !== "POP" && !hash) {
      window.scrollTo(0, 0);
    }
  }, [action, hash, pathname]);

  useEffect(() => {
    if (!hash) {
      return;
    }

    window.setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [hash, pathname]);

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
