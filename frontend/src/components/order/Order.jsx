import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Order = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8001/order/${orderId}`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement de la commande');
        }
        const data = await response.json();
        setOrderDetails(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  if (!orderDetails) {
    return <div>Aucune commande trouvée.</div>;
  }

  // ➔ Détecter si c'est un invité ou un utilisateur
  const isGuest = !orderDetails.user;

  // ➔ Calculer le total de la commande
  const totalAmount = orderDetails.items.reduce((sum, item) => sum + parseFloat(item.total_price), 0).toFixed(2);

  return (
    <div className="order-page" > 
    <h1>Détails de la commande</h1>
      {/* Partie Gauche - Détails de la commande */}
      <div className="order-summary">
       
        <p><strong>Client :</strong> {isGuest ? "Invité" : "Utilisateur inscrit"}</p>

        <div className="order-items" >
          {orderDetails.items.map((item, index) => (
            <div key={index} className="order-item" >
              <img
                src={`http://localhost:8001${item.product_image}`}
                alt={item.product_name}
               
              />
              <div>
                <h4>{item.product_name}</h4>
                <p>Quantité : {item.quantity}</p>
                <p>Prix : {item.product_price} €</p>
                <p>Total : {item.total_price} €</p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="order-total">
          <h3>Total : {totalAmount} €</h3>
        </div>
      </div>

      {/* Partie Droite - Choix du paiement */}
      <div className="payment-method">
        <h2>Choisissez votre mode de paiement</h2>
        <button
          onClick={() => setSelectedPayment('card')}
        >
          Carte Bancaire
        </button>
        <button
        
          onClick={() => setSelectedPayment('paypal')}
        >
          PayPal
        </button>

        {selectedPayment && (
          <p >
            Vous avez choisi : <strong>{selectedPayment === 'card' ? "Carte Bancaire" : "PayPal"}</strong>
          </p>
        )}
      </div>
    </div>
  );
};



export default Order;
