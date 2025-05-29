import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout.jsx";
import Home from "./components/home/Home.jsx";
import ProductList from "./components/product/ProductList.jsx";
import Cart from "./components/cart/Cart.jsx";
import Order from "./components/order/Order.jsx";
import SignInForm from "./components/user/SignInForm.jsx";
import { AuthProvider } from './components/context/AuthContext.jsx';
import UserProfile from "./components/user/UserProfile.jsx";
import OrderTracking from "./components/order/OrderTracking.jsx";
import OrderConfirmation from "./components/order/OrderConfirmation.jsx";
// import { CartProvider } from "./components/context/CartContext.jsx";
import ProductDetail from './components/product/ProductDetail.jsx';


const App = () => {
  return (
    <AuthProvider>
        <BrowserRouter>
          <Routes>
            
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/panier" element={<Cart />} />
              <Route path="produits/:category" element={<ProductList />} />
              <Route path="/commande/:orderId" element={<Order />} />
              <Route path="/connexion" element={<SignInForm />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/orderTracking/:orderId" element={<OrderTracking />} />              <Route path="/orderConfirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/produit/:productId" element={<ProductDetail />} />
              
              </Route>
          </Routes>
        </BrowserRouter>
    </AuthProvider>
    
  );
};

export default App;
