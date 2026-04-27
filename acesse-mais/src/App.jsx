import { useState } from "react";
import ProdutoPage from "./ProdutoPage";

export default function App() {
  const [cartCount, setCartCount] = useState(0);

  const handleAddToCart = (qty) => {
    setCartCount((prev) => prev + qty);
  };

  const handleNavigate = (destination) => {
    console.log("Navegar para:", destination);
    // Seus colegas substituem por: navigate(`/${destination}`)
  };

  return (
    <ProdutoPage
      cartCount={cartCount}
      onAddToCart={handleAddToCart}
      onNavigate={handleNavigate}
    />
  );
}
