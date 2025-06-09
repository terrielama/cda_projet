import React, { useEffect, useState } from "react";
import api from "../../api"; // Assure-toi que api est bien configuré (ex: axios)
import { useNavigate } from "react-router-dom";
import Loader from "../Loader"; // Ton loader personnalisé
import SMOButton from "./SMOButton";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false); // Pour afficher le loader lors de la commande
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fonction pour récupérer le panier depuis le backend
  const fetchCart = async () => {
    const cart_code = localStorage.getItem("cart_code");
    const token = localStorage.getItem("token");

    console.log("fetchCart appelé, cart_code:", cart_code);

    if (!cart_code) {
      console.warn("Aucun cart_code trouvé dans le localStorage.");
      setCart(null);
      setError("Aucun panier trouvé. Ajoutez un produit.");
      return;
    }

    try {
      const startTime = Date.now();

      // Appel API pour récupérer le panier
      const res = await api.get(`http://localhost:8001/get_cart?cart_code=${cart_code}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      console.log("Panier récupéré:", res.data);
      setCart(res.data);
      setError("");

      // Optionnel : s'assurer que le loader s'affiche au moins 3 secondes
      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }
    } catch (err) {
      console.error("Erreur récupération panier :", err);
      setError("Erreur de chargement du panier. Veuillez réessayer.");
      setCart(null);
    }
  };

  // Chargement du panier au premier rendu du composant
  useEffect(() => {
    console.log("useEffect: chargement du panier");
    fetchCart();
  }, []);

  // Mise à jour de la quantité d’un item dans le panier
  const updateQuantity = async (itemId, delta) => {
    console.log(`updateQuantity appelé sur item ${itemId} avec delta ${delta}`);

    const cart_code = localStorage.getItem("cart_code");
    if (!cart_code || !cart) {
      console.warn("Pas de cart_code ou panier vide.");
      return;
    }

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      console.warn("Item non trouvé dans le panier.");
      return;
    }

    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) {
      console.log("Quantité trop faible, suppression ignorée ici. Utilisez Supprimer.");
      return;
    }

    try {
      await api.patch(
        `http://localhost:8001/update_quantity?cart_code=${cart_code}`,
        { item_id: itemId, quantity: newQuantity }
      );
      console.log("Quantité mise à jour avec succès");
      fetchCart();
      setError("");
    } catch (error) {
      console.error("Erreur mise à jour quantité :", error);
      setError("Erreur de mise à jour de la quantité.");
    }
  };

  // Supprimer un produit du panier
  const removeProduct = async (itemId) => {
    console.log("Suppression du produit id:", itemId);
    const cart_code = localStorage.getItem("cart_code");
    if (!cart_code) {
      console.warn("Pas de cart_code pour suppression");
      return;
    }

    try {
      await api.post(
        `http://localhost:8001/remove_item?cart_code=${cart_code}`,
        { item_id: itemId }
      );
      console.log("Produit supprimé avec succès");
      fetchCart();
      setError("");
    } catch (error) {
      console.error("Erreur suppression produit :", error);
      setError("Erreur lors de la suppression du produit.");
    }
  };

  // Créer une commande depuis le panier
  const handleOrder = async () => {
    console.log("handleOrder appelé");

    if (!cart?.items.length) {
      setError("Votre panier est vide.");
      console.warn("Commande annulée: panier vide");
      return;
    }

    try {
      setLoading(true); // Affiche le loader lors de la création de commande
      const response = await api.post("http://localhost:8001/create_order", {
        cart_code: localStorage.getItem("cart_code"),
      });
      console.log("Commande créée:", response.data);
      // Reset panier et localStorage
      setCart(null);
      localStorage.removeItem("cart_code");

      // Redirection après 1 seconde pour laisser le loader visible
      setTimeout(() => {
        setLoading(false);
        navigate(`/commande/${response.data.order_id}`);
      }, 1000);
      setError("");
    } catch (error) {
      console.error("Erreur serveur commande :", error.response?.data || error.message);
      setError("Erreur lors de la commande, veuillez réessayer.");
      setLoading(false);
    }
  };

  // Affichage du loader uniquement lors de la commande
  if (loading) {
    console.log("Affichage du Loader");
    return <Loader />;
  }

  // Calculs des prix
  const totalPrice = cart?.sum_total || 0;
  const shippingCost = totalPrice >= 70 ? 0 : 4;
  const finalPrice = totalPrice + shippingCost;

  return (
    <div className="cart-container">
      <h1 className="center-text">Mon Panier</h1>

      {cart?.items.length ? (
        cart.items.map((item) => (
          <div key={item.id} className="cart-item">
            <img
              src={
                item.product.image?.startsWith("http")
                  ? item.product.image
                  : item.product.image
                  ? `http://localhost:8001${item.product.image}`
                  : "/default-image.png"
              }
              alt={item.product.name}
              className="cart-product-image"
            />

            <div className="product-info">
              <h2>{item.product.name}</h2>
              <p>
                Prix unitaire : {item.product.price} €<br />
                Quantité : {item.quantity}
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
        ))
      ) : (
        <p>Votre panier est vide.</p>
      )}

      {cart && (
        <div className="cart-summary">
          <h2>Total</h2>
          <p>Sous-total : {totalPrice.toFixed(2)} €</p>
          <p>Livraison : {shippingCost === 0 ? "Gratuite" : `${shippingCost} €`}</p>
          <p>Total à payer : {finalPrice.toFixed(2)} €</p>

          {/* Le bouton est désactivé pendant le chargement */}
          <SMOButton onClick={handleOrder} disabled={loading} />

          {error && <p className="error-message">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default Cart;
