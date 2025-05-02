import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from 'react-router-dom'; 
import Loader from "../Loader";
import SMOButton from "./SMOButton.jsx"

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true); // Start in loading mode
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchCart = async () => {
    const cart_code = localStorage.getItem("cart_code");
    if (!cart_code) {
      setLoading(false); // Important: stop loader if no cart
      return;
    }

    try {
      const res = await api.get(`http://localhost:8001/get_cart?cart_code=${cart_code}`);
      setCart(res.data);
    } catch (err) {
      console.error(err);
      setError("Erreur de chargement du panier. Veuillez réessayer.");
    } finally {
      setLoading(false); // always stop loader
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, delta) => {
    const cart_code = localStorage.getItem("cart_code");
    if (!cart_code) return;
    try {
      await api.post(`http://localhost:8001/update_quantity?cart_code=${cart_code}`, {
        item_id: itemId,
        delta,
      });
      fetchCart();
    } catch (error) {
      console.error("Erreur mise à jour quantité", error);
      setError("Erreur de mise à jour de la quantité.");
    }
  };

  const removeProduct = async (itemId) => {
    const cart_code = localStorage.getItem("cart_code");
    if (!cart_code) return;
    try {
      await api.post(`http://localhost:8001/remove_item?cart_code=${cart_code}`, { item_id: itemId });
      fetchCart();
    } catch (error) {
      console.error("Erreur suppression produit", error);
      setError("Erreur lors de la suppression du produit.");
    }
  };

  const totalPrice = cart?.sum_total || 0;
  const shippingCost = totalPrice >= 70 ? 0 : 4;
  const finalPrice = totalPrice + shippingCost;

const handleOrder = async () => {
  if (!cart?.items.length) {
    setError("Votre panier est vide.");
    return;
  }

  try {
    setLoading(true); // On active le Loader

    const response = await api.post("http://localhost:8001/create_order", {
      cart_code: localStorage.getItem("cart_code"),
    });

    console.log(response);

    setCart(null);
    localStorage.removeItem("cart_code");

    // Laisser le Loader s'afficher un court instant avant de rediriger
    setTimeout(() => {
      navigate(`/commande/${response.data.order_id}`);
    }, 1000); // 1000 ms = 1 seconde
  } catch (error) {
    console.error("Erreur serveur:", error.response?.data || error.message);
    setError("Erreur lors de la commande, veuillez réessayer.");
    setLoading(false);
  }
};


  // 1. Loader global
  if (loading) {
    return <Loader />;
  }

  // 2. Ensuite affichage normal
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
