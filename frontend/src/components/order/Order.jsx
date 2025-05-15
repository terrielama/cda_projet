import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PaiementForm from './PaymentForm';

const Order = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [userName, setUserName] = useState({ first_name: null, last_name: null });

  // 1) Récupération de la commande (order + items)
  useEffect(() => {
    async function fetchOrder() {
      try {
        console.log(`Récupération commande id=${orderId}…`);
        const res = await fetch(`http://localhost:8001/order/${orderId}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();
        console.log('Réponse API orderDetails:', data);

        // Sécurité : items doit être un tableau
        if (!data.items) {
          console.warn('Warning: "items" manquant dans orderDetails');
          data.items = [];
        } else if (!Array.isArray(data.items)) {
          console.warn('Warning: "items" n\'est pas un tableau, conversion en tableau');
          data.items = Object.values(data.items);
        }

        setOrderDetails(data);
      } catch (err) {
        console.error('Erreur fetchOrderDetails:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (orderId) fetchOrder();
  }, [orderId]);

  // 2) Récupération du prénom/nom si connecté
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    fetch('http://localhost:8001/get_username', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('401 Unauthorized');
        return res.json();
      })
      .then(data => {
        console.log('Utilisateur connecté:', data);
        setUserName({ first_name: data.first_name, last_name: data.last_name });
      })
      .catch(err => {
        console.warn('Erreur get_username:', err);
        setUserName({ first_name: null, last_name: null });
      });
  }, []);

  // 3) Association user → order si connecté et infos prêtes
  useEffect(() => {
    if (!userName.first_name || !orderDetails) return;
    async function associate() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        console.log(`Association user → order ${orderId}…`);
        const res = await fetch('http://localhost:8001/associate_user_to_order/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId }),
        });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        console.log('Utilisateur associé à la commande avec succès');
      } catch (err) {
        console.error('Erreur association:', err);
      }
    }
    associate();
  }, [userName, orderDetails, orderId]);

  if (loading) return <div>Chargement…</div>;
  if (error) return <div>Erreur : {error}</div>;
  if (!orderDetails) return <div>Aucune commande trouvée.</div>;

  const { items, order } = orderDetails;

  // Logs utiles avant rendu
  console.log('order:', order);
  console.log('items:', items);

  // Utilisateur invité ?
  const isGuest = !userName.first_name && (!order.user || !order.user.first_name);

  // Calcul total à payer depuis les items (total_price est déjà float)
  const totalAmount = items.length
    ? items.reduce((sum, i) => sum + parseFloat(i.total_price), 0).toFixed(2)
    : '0.00';

  return (
    <div className="order-page">
      <h1>Détails de la commande #{order.id}</h1>

      <div className="order-summary">
        <p>
          <strong>Client :</strong>{' '}
          {userName.first_name
            ? `${userName.first_name} ${userName.last_name}`
            : isGuest
            ? 'Invité'
            : 'Utilisateur inscrit'}
        </p>

        <div className="order-items">
          {items.length === 0 ? (
            <p>Aucun produit dans cette commande.</p>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="order-item" style={{ display: 'flex', marginBottom: 10 }}>
                <img
                  src={`http://localhost:8001${item.product_image || '/default-image.jpg'}`}
                  alt={item.product_name}
                  style={{ width: 100, height: 100, objectFit: 'cover', marginRight: 10 }}
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = '/default-image.jpg';
                  }}
                />
                <div className="order-text">
                  <h4>{item.product_name}</h4>
                  <p>
                    Quantité : {item.quantity} | Prix unitaire : {item.price}€ | Total : {item.total_price}€
                  </p>
                </div>
              </div>
            ))
          )} 
          <div className="order-total">
          <h3>Total à payer : {totalAmount} €</h3>
        </div>
      </div>
        </div>

       

      <div className="payment-method">
        <h2>Choisissez votre mode de paiement</h2>
        <button
          onClick={() => {
            console.log('Paiement sélectionné : Carte Bancaire');
            setSelectedPayment('card');
          }}
        >
          Carte Bancaire
        </button>
        <button
          onClick={() => {
            console.log('Paiement sélectionné : PayPal');
            setSelectedPayment('paypal');
          }}
        >
          PayPal
        </button>

        {selectedPayment && (
          <p>
            Vous avez choisi : <strong>{selectedPayment === 'card' ? 'Carte Bancaire' : 'PayPal'}</strong>
          </p>
        )}

        {selectedPayment === 'card' && <PaiementForm />}
      </div>
    </div>
  );
};

export default Order;
