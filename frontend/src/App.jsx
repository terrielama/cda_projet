import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout.jsx";
import Home from "./components/home/Home.jsx";
import ProductList from "./components/product/ProductList.jsx";
import Cart from "./components/cart/Cart.jsx";
import Order from "./components/order/Order.jsx";
import Login from "./components/user/SignInForm.jsx";
import { AuthProvider } from './contexts/AuthContext';  // Import du AuthProvider

function App() {
  return (
    // Envelopper l'application avec AuthProvider pour fournir l'état d'authentification à tous les composants
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="produits/:category" element={<ProductList />} />
            <Route path="/commande/:orderId" element={<Order />} />
            <Route path="/login" element={<Login />} />
            {/* Tu peux ajouter d'autres routes ici */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
