import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PaiementForm from './PaymentForm'; // Import PaiementForm component

const Order = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [firstName, setFirstName] = useState(null);

  // Charger les détails de la commande
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8001/order/${orderId}`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement de la commande');
        }
        const data = await response.json();
        console.log('Détails de la commande récupérés:', data);
        setOrderDetails(data);
      } catch (error) {
        console.error('Erreur dans la récupération des détails de la commande:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Récupérer le prénom de l'utilisateur connecté
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetch("http://localhost:8001/get_username", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Prénom récupéré :", data.first_name);
          setFirstName(data.first_name);
        })
        .catch((err) => {
          console.warn("Erreur prénom :", err);
          setFirstName(null);
        });
    }
  }, []);

  // Associer l'utilisateur à la commande
  useEffect(() => {
    // Si l'utilisateur est connecté, on associe l'utilisateur à la commande
    if (firstName && orderDetails) {
      const associateUserToOrder = async () => {
        try {
          const token = localStorage.getItem("access_token");
          if (token) {
            const response = await fetch(`http://localhost:8001/associate_user_to_order/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ orderId }),
            });
            console.log("✅ Utilisateur associé à la commande:", response);
          }
        } catch (err) {
          console.error("❌ Erreur lors de l'association :", err);
        }
      };

      associateUserToOrder();
    }
  }, [firstName, orderDetails, orderId]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;
  if (!orderDetails) return <div>Aucune commande trouvée.</div>;

  const isGuest = !firstName && !orderDetails.user;

  const totalAmount = orderDetails.items
    .reduce((sum, item) => sum + parseFloat(item.total_price), 0)
    .toFixed(2);

  return (
    <div className="order-page">
      <h1>Détails de la commande</h1>

      {/* Partie Gauche - Détails */}
      <div className="order-summary">
        <p>
          <strong>Client :</strong>{" "}
          {firstName ? ` ${firstName}` : isGuest ? "Invité" : "Utilisateur inscrit"}
        </p>

        <div className="order-items">
          {orderDetails.items.map((item, index) => (
            <div key={index} className="order-item">
              {/* Assure-toi que l'image est correctement récupérée */}
              <img
                src={`http://localhost:8001${item.product_image || '/default-image.jpg'}`}
                alt={item.product_name}
                onError={(e) => {
                  e.target.onerror = null;  // empêche la boucle infinie
                  e.target.src = '/default-image.jpg';  // image par défaut en cas d'erreur
                }}
              />
              <div className="order-text">
                <h4>{item.product_name}</h4>
                <p>Quantité : {item.quantity}  | Prix : {item.total_price} €</p>
              </div>
            </div>
          ))}
        </div>

        <div className="order-total">
          <h3>Total : {totalAmount} €</h3>
        </div>
      </div>

      {/* Partie Droite - Paiement */}
      <div className="payment-method">
        <h2>Choisissez votre mode de paiement</h2>
        <button onClick={() => setSelectedPayment('card')}>Carte Bancaire</button>
        <button onClick={() => setSelectedPayment('paypal')}>PayPal</button>

        {selectedPayment && (
          <p>
            Vous avez choisi :{' '}
            <strong>{selectedPayment === 'card' ? "Carte Bancaire" : "PayPal"}</strong>
          </p>
        )}

        {/* Afficher le formulaire PaiementForm si "Carte Bancaire" est sélectionné */}
        {selectedPayment === 'card' && <PaiementForm />}
      </div>
    </div>
  );
};

export default Order;
