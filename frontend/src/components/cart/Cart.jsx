import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from 'react-router-dom'; 
import Loader from "../Loader";
import SMOButton from "./SMOButton.jsx"

const Cart = () => {
  const [cart, setCart] = useState(null); // Stocke le panier récupéré
  const [loading, setLoading] = useState(true); // Indique si le panier est en cours de chargement
  const [error, setError] = useState(""); // Stocke les messages d'erreur
  const navigate = useNavigate(); // Utilisé pour la navigation après une commande

  // Fonction pour récupérer le panier depuis l'API
  const fetchCart = async () => {
    const cart_code = localStorage.getItem("cart_code"); // Récupère le cart_code du localStorage
    const token = localStorage.getItem("token"); // Récupère le token d'authentification

    // Si aucun cart_code n'est trouvé, on arrête le chargement
    if (!cart_code) {
      setLoading(false);
      return;
    }

    try {
      // Envoie une requête GET pour récupérer le panier
      const res = await api.get(`http://localhost:8001/get_cart?cart_code=${cart_code}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "", // Ajoute le token si l'utilisateur est connecté
        },
      });
      setCart(res.data); // Mise à jour de l'état avec les données du panier
    } catch (err) {
      console.error(err);
      setError("Erreur de chargement du panier. Veuillez réessayer."); // Message d'erreur en cas de problème
    } finally {
      setLoading(false); // Arrête le loader une fois la réponse reçue
    }
  };

  // On appelle fetchCart dès le chargement de la page
  useEffect(() => {
    fetchCart();
  }, []);

  // Fonction pour mettre à jour la quantité d'un produit dans le panier
  const updateQuantity = async (itemId, delta) => {
    const cart_code = localStorage.getItem("cart_code"); // Récupère le cart_code
    if (!cart_code) return;

    try {
      // Envoie une requête POST pour mettre à jour la quantité
      await api.post(`http://localhost:8001/update_quantity?cart_code=${cart_code}`, {
        item_id: itemId,
        delta,
      });
      fetchCart(); // Rafraîchit le panier après la mise à jour
    } catch (error) {
      console.error("Erreur mise à jour quantité", error);
      setError("Erreur de mise à jour de la quantité.");
    }
  };

  // Fonction pour supprimer un produit du panier
  const removeProduct = async (itemId) => {
    const cart_code = localStorage.getItem("cart_code"); // Récupère le cart_code
    if (!cart_code) return;

    try {
      // Envoie une requête POST pour supprimer le produit
      await api.post(`http://localhost:8001/remove_item?cart_code=${cart_code}`, { item_id: itemId });
      fetchCart(); // Rafraîchit le panier après la suppression
    } catch (error) {
      console.error("Erreur suppression produit", error);
      setError("Erreur lors de la suppression du produit.");
    }
  };

  // Calcul du total et du prix final (y compris la livraison)
  const totalPrice = cart?.sum_total || 0;
  const shippingCost = totalPrice >= 70 ? 0 : 4; // Livraison gratuite si le total dépasse 70€
  const finalPrice = totalPrice + shippingCost;

  // Fonction pour traiter la commande
  const handleOrder = async () => {
    if (!cart?.items.length) {
      setError("Votre panier est vide."); // Vérifie que le panier contient des articles
      return;
    }

    try {
      setLoading(true); // Affiche le loader pendant la création de la commande

      // Envoie la requête pour créer la commande
      const response = await api.post("http://localhost:8001/create_order", {
        cart_code: localStorage.getItem("cart_code"), // Envoie le cart_code
      });

      console.log(response);

      setCart(null); // Réinitialise le panier après la commande
      localStorage.removeItem("cart_code"); // Supprime le cart_code du localStorage

      // Redirige vers la page de commande après un court délai
      setTimeout(() => {
        navigate(`/commande/${response.data.order_id}`); // Redirige vers la page de la commande avec l'ID de la commande
      }, 1000); // 1 seconde de délai
    } catch (error) {
      console.error("Erreur serveur:", error.response?.data || error.message);
      setError("Erreur lors de la commande, veuillez réessayer."); // Message d'erreur en cas d'échec
      setLoading(false);
    }
  };

  // Affichage du loader pendant le chargement
  if (loading) {
    return <Loader />;
  }

  // Affichage du panier une fois qu'il est chargé
  return (
    <div className="cart-container">
      <h1 className="center-text">Mon Panier</h1>

      {cart?.items.length ? (
        cart.items.map((item) => (
          <div key={item.product.id} className="cart-item">
            <img
              src={`http://localhost:8001${item.product.image}`}
              alt={item.product.name}
              className="product-image"
            />
            <div className="product-info">
              <h2>{item.product.name}</h2>
              <p>{item.product.price} € x {item.quantity}</p>
              <div className="quantity-controls">
                <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)}>+</button>
              </div>
              <button className="remove-button" onClick={() => removeProduct(item.id)}>
                Supprimer
              </button>
            </div>
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