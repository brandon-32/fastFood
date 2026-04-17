import { Routes, Route } from "react-router-dom"; // Importar de la librería
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import InventarioPage from "./pages/InventarioPage";
import MenuPage from "./pages/MenuPage";
import CustomerMenuPage from "./pages/CustomerMenuPage";

export default function App() {
  // ¡Adiós useState! El enrutador se encarga de saber en qué página estamos según la URL

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* Asumo que "Home" para ti es el Inventario */}
      <Route path="/inventario" element={<InventarioPage />} /> 
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/menu-completo" element={<CustomerMenuPage />} />
    </Routes>
  );
}