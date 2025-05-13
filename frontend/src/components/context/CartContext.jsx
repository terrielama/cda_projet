import { createContext, useState, useEffect } from "react";
import api from "../../api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [numCartItems, setNumCartItems] = useState(0);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access_token"));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refresh_token"));
  const cart_code = localStorage.getItem("cart_code");

  // Fonction pour actualiser le panier en fonction du cart_code
  const refreshCart = () => {
    if (cart_code) {
      api.get(`get_cart_stat?cart_code=${cart_code}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      })
        .then(res => {
          setNumCartItems(res.data.total_items);
        })
        .catch(err => {
          console.error("Erreur mise à jour du panier :", err.message);
        });
    }
  };

  // Fonction pour actualiser le token d'accès avec le refresh token
  const refreshAccessToken = async () => {
    if (refreshToken) {
      try {
        const response = await api.post("/refresh_token", { refresh: refreshToken });
        const { access } = response.data;
        setAccessToken(access);
        localStorage.setItem("access_token", access); // Sauvegarder le nouveau access token
      } catch (error) {
        console.error("Erreur lors du rafraîchissement du token :", error.message);
      }
    }
  };

  // Rafraîchir le panier et vérifier le refresh token à chaque connexion
  useEffect(() => {
    if (!accessToken) {
      refreshAccessToken();
    } else {
      refreshCart();
    }
  }, [accessToken, refreshToken, cart_code]);

  return (
    <CartContext.Provider value={{ numCartItems, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};
