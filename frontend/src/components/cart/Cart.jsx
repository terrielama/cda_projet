import React, { useEffect, useState } from "react";
import api from "../../api"; // Assure-toi que api est configuré (ex: axios)
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";
import SMOButton from "./SMOButton";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Récupérer le panier depuis backend
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
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setCart(res.data);
    } catch (err) {
      console.error("Erreur récupération panier :", err);
      setError("Erreur de chargement du panier. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Met à jour la quantité d’un item dans le panier
  const updateQuantity = async (itemId, delta) => {
    const cart_code = localStorage.getItem("cart_code");
    if (!cart_code || !cart) return;

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return; // Option : supprimer à la place

    try {
      await api.patch(
        `http://localhost:8001/update_quantity?cart_code=${cart_code}`,
        { item_id: itemId, quantity: newQuantity }
      );
      fetchCart();
    } catch (error) {
      console.error("Erreur mise à jour quantité :", error);
      setError("Erreur de mise à jour de la quantité.");
    }
  };

  // Supprime un produit du panier
  const removeProduct = async (itemId) => {
    const cart_code = localStorage.getItem("cart_code");
    if (!cart_code) return;

    try {
      await api.post(
        `http://localhost:8001/remove_item?cart_code=${cart_code}`,
        { item_id: itemId }
      );
      fetchCart();
    } catch (error) {
      console.error("Erreur suppression produit :", error);
      setError("Erreur lors de la suppression du produit.");
    }
  };

  // Crée une commande
  const handleOrder = async () => {
    if (!cart?.items.length) {
      setError("Votre panier est vide.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("http://localhost:8001/create_order", {
        cart_code: localStorage.getItem("cart_code"),
      });
      // Reset panier
      setCart(null);
      localStorage.removeItem("cart_code");
      // Redirige vers la page commande
      setTimeout(() => {
        navigate(`/commande/${response.data.order_id}`);
      }, 1000);
    } catch (error) {
      console.error("Erreur serveur commande :", error.response?.data || error.message);
      setError("Erreur lors de la commande, veuillez réessayer.");
      setLoading(false);
    }
  };

  // Fonction exemple pour ajouter un produit au panier
  const addToCart = async (product) => {
    const cart_code = localStorage.getItem("cart_code");
    if (!cart_code) {
      console.error("Impossible d'ajouter : cartCode manquant dans localStorage");
      return;
    }
    if (!product) {
      console.error("Impossible d'ajouter : produit manquant");
      return;
    }

    try {
      await api.post(`http://localhost:8001/add_item?cart_code=${cart_code}`, {
        product_id: product.id,
        quantity: 1,
      });
      fetchCart();
    } catch (error) {
      console.error("Erreur ajout au panier :", error);
    }
  };

  if (loading) return <Loader />;

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

          <SMOButton onClick={handleOrder} disabled={loading} />

          {error && <p className="error-message">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default Cart;
