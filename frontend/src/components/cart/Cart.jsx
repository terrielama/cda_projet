import React, { useEffect, useState } from "react";
import api from "../../api";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderMessage, setOrderMessage] = useState("");

  // Fetch cart data from API
  const fetchCart = async () => {
    const cart_code = localStorage.getItem("cart_code");
    if (!cart_code) return;

    try {
      const res = await api.get(`http://localhost:8001/get_cart?cart_code=${cart_code}`);
      setCart(res.data);
    } catch (err) {
      console.error(err);
      setError("Erreur de chargement du panier. Veuillez réessayer.");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Update product quantity
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

  // Remove product from cart
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

  // Calculate total price and shipping cost
  const totalPrice = cart?.sum_total || 0;
  const shippingCost = totalPrice >= 70 ? 0 : 4;
  const finalPrice = totalPrice + shippingCost;

  // Handle order creation
  const handleOrder = async () => {
    if (!cart?.items.length) {
      setOrderMessage("Votre panier est vide.");
      return;
    }

    if (!name.trim() || !email.trim()) {
      setOrderMessage("Veuillez entrer votre nom et votre email.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/create_order", {
        cart_code: localStorage.getItem("cart_code"),
        name,
        email,
      });

      setOrderMessage("Commande envoyée avec succès !");
      setCart(null);
      setName("");
      setEmail("");
      localStorage.removeItem("cart_code");
    } catch (error) {
      console.error(error);
      setOrderMessage("Erreur lors de la commande, veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-container">
      <h1 className="center-text">Mon Panier</h1>

      {cart?.items.length ? (
        cart.items.map((item) => (
          <div key={item.product.id} className="cart-item">
            {/* Display product image */}
            <img
              src={`http://localhost:8001${item.product.image}`} // Utilisez l'URL correcte avec le port 8001
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

          <input
            type="text"
            placeholder="Votre nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="validate-btn" onClick={handleOrder} disabled={loading}>
            {loading ? "Commande en cours..." : "Valider ma commande"}
          </button>

          {orderMessage && <p className="order-message">{orderMessage}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default Cart;
