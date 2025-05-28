import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from 'react-router-dom'; 
import Loader from "../Loader";
import SMOButton from "./SMOButton"

const Cart = () => {
  const [cart, setCart] = useState(null); // Contient les données du panier
  const [loading, setLoading] = useState(true); // Gère l'état de chargement
  const [error, setError] = useState(""); // Message d'erreur
  const navigate = useNavigate();

  // 🛒 Fonction de récupération du panier
  const fetchCart = async () => {
    const cart_code = localStorage.getItem("cart_code");
    const token = localStorage.getItem("token");

    if (!cart_code) {
      console.warn("Aucun cart_code trouvé dans le localStorage.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`http://localhost:8001/get_cart?cart_code=${cart_code}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      console.log("✅ Réponse API get_cart :", res.data);
      setCart(res.data);
    } catch (err) {
      console.error("❌ Erreur lors de la récupération du panier :", err);
      setError("Erreur de chargement du panier. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Appel fetchCart au montage
  useEffect(() => {
    fetchCart();
  }, []);

  // 🔄 Mettre à jour la quantité d’un article
  const updateQuantity = async (itemId, delta) => {
    const cart_code = localStorage.getItem("cart_code");
    if (!cart_code || !cart) return;

    const item = cart.items.find(i => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return; // Option : supprimer à la place

    try {
      console.log(`🔧 Mise à jour quantité → ID: ${itemId}, nouvelle: ${newQuantity}`);
      await api.patch(`http://localhost:8001/update_quantity?cart_code=${cart_code}`, {
        item_id: itemId,
        quantity: newQuantity,
      });
      fetchCart(); // 🔄 Rafraîchir le panier
    } catch (error) {
      console.error("❌ Erreur mise à jour quantité :", error);
      setError("Erreur de mise à jour de la quantité.");
    }
  };

  // ❌ Supprimer un produit du panier
  const removeProduct = async (itemId) => {
    const cart_code = localStorage.getItem("cart_code");
    if (!cart_code) return;

    try {
      console.log(`🗑️ Suppression du produit ID: ${itemId}`);
      await api.post(`http://localhost:8001/remove_item?cart_code=${cart_code}`, {
        item_id: itemId,
      });
      fetchCart(); // 🔄 Rafraîchir le panier
    } catch (error) {
      console.error("❌ Erreur suppression produit :", error);
      setError("Erreur lors de la suppression du produit.");
    }
  };

  // 💰 Calculs totaux
  const totalPrice = cart?.sum_total || 0;
  const shippingCost = totalPrice >= 70 ? 0 : 4;
  const finalPrice = totalPrice + shippingCost;

  // ✅ Créer une commande
  const handleOrder = async () => {
    if (!cart?.items.length) {
      setError("Votre panier est vide.");
      return;
    }

    try {
      setLoading(true);
      console.log("📦 Création de la commande...");

      const response = await api.post("http://localhost:8001/api/create_order", {
        cart_code: localStorage.getItem("cart_code"),
      });

      console.log("✅ Commande créée avec succès :", response.data);

      // 🧹 Reset panier
      setCart(null);
      localStorage.removeItem("cart_code");

      // 🔁 Redirection vers la page commande
      setTimeout(() => {
        navigate(`/commande/${response.data.order_id}`);
      }, 1000);
    } catch (error) {
      console.error("❌ Erreur serveur commande :", error.response?.data || error.message);
      setError("Erreur lors de la commande, veuillez réessayer.");
      setLoading(false);
    }
  };

  // 🌀 Affiche le loader pendant le chargement
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="cart-container">
      <h1 className="center-text">Mon Panier</h1>

      {/* 🧾 Liste des produits du panier */}
      {cart?.items.length ? (
        cart.items.map((item) => {
          console.log("🧾 Produit affiché :", item.product);
          return (
            <div key={item.product.id} className="cart-item">
              <img
                src={`http://localhost:8001${item.product.image}`}
                alt={item.product.name}
                className="cart-product-image"
              />
              <div className="product-info">
                <h2>{item.product.name}</h2>
                <p>
                  Prix unitaire : {item.product.price} €<br />
                  Quantité : {item.quantity}<br />
                </p>
              </div>

              <div className="cart-quantity-controls">
                <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)}>+</button>
              </div>

              <button className="remove-button" onClick={() => removeProduct(item.id)}>
                Supprimer
              </button>
            </div>
          );
        })
      ) : (
        <p>Votre panier est vide.</p>
      )}

      {/* ✅ Résumé du panier */}
      {cart && (
        <div className="cart-summary">
          <h2>Total</h2>
          <p>Sous-total : {totalPrice.toFixed(2)} €</p>
          <p>Livraison : {shippingCost === 0 ? "Gratuite" : `${shippingCost} €`}</p>
          <p>Total à payer : {finalPrice.toFixed(2)} €</p>

          {/* 🛒 Bouton commander */}
          <SMOButton onClick={handleOrder} disabled={loading} />

          {/* ⚠️ Message d'erreur */}
          {error && <p className="error-message">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default Cart;
