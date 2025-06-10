import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";
import SMOButton from "./SMOButton";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchCart = async () => {
    const cart_code = localStorage.getItem("cart_code");
    const token = localStorage.getItem("token");

    console.log("fetchCart appelé, cart_code:", cart_code);

    if (!cart_code) {
      setCart(null);
      setError("Aucun panier trouvé. Ajoutez un produit.");
      return;
    }

    try {
      const startTime = Date.now();
      const res = await api.get(`http://localhost:8001/get_cart?cart_code=${cart_code}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      console.log("Panier récupéré:", res.data);
      setCart(res.data);
      setError("");

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
    console.log("useEffect: chargement du panier");
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, delta) => {
    console.log(`updateQuantity appelé sur item ${itemId} avec delta ${delta}`);
    const cart_code = localStorage.getItem("cart_code");
    if (!cart_code || !cart) return;

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    try {
      await api.patch(
        `http://localhost:8001/update_quantity?cart_code=${cart_code}`,
        { item_id: itemId, quantity: newQuantity }
      );
      console.log("Quantité mise à jour avec succès");
      fetchCart();
    } catch (error) {
      console.error("Erreur mise à jour quantité :", error);
      setError("Erreur de mise à jour de la quantité.");
    }
  };

  const increaseItemQuantity = async (itemId) => {
    console.log("Augmenter quantité pour item:", itemId);
    try {
      await api.post("http://localhost:8001/increase_item", { item_id: itemId });
      fetchCart();
    } catch (err) {
      console.error("Erreur lors de l'augmentation de la quantité:", err);
      setError("Stock insuffisant ou erreur serveur.");
    }
  };

  const decreaseItemQuantity = async (itemId) => {
    console.log("Diminuer quantité pour item:", itemId);
    try {
      await api.post("http://localhost:8001/decrease_item", { item_id: itemId });
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
      await api.post(`http://localhost:8001/remove_item?cart_code=${cart_code}`, {
        item_id: itemId,
      });
      console.log("Produit supprimé avec succès");
      fetchCart();
    } catch (error) {
      console.error("Erreur suppression produit :", error);
      setError("Erreur lors de la suppression.");
    }
  };

  const handleOrder = async () => {
    console.log("handleOrder appelé");

    if (!cart?.items.length) {
      setError("Votre panier est vide.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("http://localhost:8001/create_order", {
        cart_code: localStorage.getItem("cart_code"),
      });
      console.log("Commande créée:", response.data);
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