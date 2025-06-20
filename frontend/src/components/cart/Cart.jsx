import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";
import SMOButton from "./SMOButton";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stockErrors, setStockErrors] = useState({});
  const navigate = useNavigate();

  const fetchCart = async () => {
    const cart_code = localStorage.getItem("cart_code");
    const token = localStorage.getItem("token");

    if (!cart_code) {
      setCart(null);
      setError("Aucun panier trouvé. Ajoutez un produit.");
      return;
    }

    try {
      const startTime = Date.now();
      const res = await api.get(
        `get_cart?cart_code=${cart_code}`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      setCart(res.data);
      setError("");
      setStockErrors({});

      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }
    } catch (err) {
      console.error("Erreur récupération panier :", err);
      setError("Erreur de chargement du panier.");
      setCart(null);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const increaseItemQuantity = async (itemId) => {
    try {
      await api.post("increase_item", { item_id: itemId });
      fetchCart();
    } catch (err) {
      console.error("Erreur lors de l'augmentation de la quantité:", err);
      setStockErrors((prev) => ({
        ...prev,
        [itemId]: "Stock insuffisant pour ce produit.",
      }));
    }
  };

  const decreaseItemQuantity = async (itemId) => {
    try {
      await api.post("decrease_item", { item_id: itemId });
      fetchCart();
    } catch (err) {
      console.error("Erreur lors de la diminution de la quantité:", err);
      setError("Erreur serveur.");
    }
  };

  const removeProduct = async (itemId) => {
    const cart_code = localStorage.getItem("cart_code");
    if (!cart_code) return;

    try {
      await api.post(`remove_item?cart_code=${cart_code}`, {
        item_id: itemId,
      });
      fetchCart();
    } catch (error) {
      console.error("Erreur suppression produit :", error);
      setError("Erreur lors de la suppression.");
    }
  };

  const handleOrder = async () => {
    if (!cart?.items.length) {
      setError("Votre panier est vide.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("create_order", {
        cart_code: localStorage.getItem("cart_code"),
      });
      setCart(null);
      localStorage.removeItem("cart_code");

      setTimeout(() => {
        setLoading(false);
        navigate(`/commande/${response.data.order_id}`);
      }, 1000);
    } catch (error) {
      console.error("Erreur serveur commande :", error.response?.data || error.message);
      setError("Erreur lors de la commande.");
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const totalPrice = cart?.sum_total || 0;
  const shippingCost = totalPrice >= 70 ? 0 : 4;
  const finalPrice = totalPrice + shippingCost;

  return (
    <div className="cart-container">
      <h1 className="center-text">Mon Panier</h1>

      {cart?.items?.length > 0 ? (
        cart.items.map((item) => (
          <div key={item.id} className="cart-item">
            <img
              src={
                item.image?.startsWith("http")
                  ? item.image
                  : item.image
                  ? `http://localhost:8001${item.image}`
                  : "/default-image.png"
              }
              alt={item.product.name}
              className="cart-product-image"
            />

            <div className="product-info">
              <h2>{item.product.name}</h2>
              {item.size && (
                <p className="text-sm text-gray-700">
                  Taille sélectionnée : <strong>{item.size}</strong>
                </p>
              )}
              <p>
                Prix unitaire : {item.product.price} €<br />
                Quantité : {item.quantity}
              </p>
              {stockErrors[item.id] && (
                <p className="error-message">{stockErrors[item.id]}</p>
              )}
            </div>

            <div className="cart-quantity-controls">
              <button onClick={() => decreaseItemQuantity(item.id)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => increaseItemQuantity(item.id)}>+</button>
            </div>

            <button
              className="remove-button"
              onClick={() => removeProduct(item.id)}
            >
              Supprimer
            </button>
          </div>
        ))
      ) : (
        <p>Votre panier est vide.</p>
      )}

      {cart && (
        <div className="cart-summary">
          <h2>Total</h2>
          <p>Sous-total : {totalPrice.toFixed(2)} €</p>
          <p>
            Livraison :{" "}
            {shippingCost === 0 ? "Gratuite" : `${shippingCost.toFixed(2)} €`}
          </p>
          <p>Total à payer : {finalPrice.toFixed(2)} €</p>

          <SMOButton onClick={handleOrder} disabled={loading} />

          {error && <p className="error-message">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default Cart;
