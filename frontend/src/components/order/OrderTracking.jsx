import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';

const OrderTracking = () => {
  const { orderId } = useParams();
  const location = useLocation();

  const [orderDetails, setOrderDetails] = useState(location.state?.orderDetails || null);
  const [loading, setLoading] = useState(!orderDetails);
  const [error, setError] = useState(null);

  const clientInfo = location.state?.clientInfo || null;
  const paymentMethod = location.state?.paymentMethod || null;

  useEffect(() => {
    console.log('🚀 location.state:', location.state);
  }, [location.state]);

  useEffect(() => {
    if (!orderDetails) {
      const fetchOrderDetails = async () => {
        setLoading(true);
        try {
          const res = await fetch(`http://localhost:8001/order/${orderId}`);
          if (!res.ok) throw new Error('Erreur API ' + res.status);
          const data = await res.json();
          setOrderDetails(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchOrderDetails();
    }
  }, [orderDetails, orderId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date non disponible';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: 'red' }}>Erreur : {error}</div>;

  return (
    <div className="order-tracking-container">
    <h1>Suivi de la commande #{orderId}</h1>
  
    {clientInfo ? (
      <section className="client-info">
        <h2>Informations client</h2>
        <p><strong>Prénom :</strong> {clientInfo.firstName}</p>
        <p><strong>Nom :</strong> {clientInfo.lastName}</p>
        <p><strong>Adresse :</strong> {clientInfo.address}</p>
        <p><strong>Téléphone :</strong> {clientInfo.phone}</p>
      </section>
    ) : (
      <p className="info-placeholder">Aucune information client disponible.</p>
    )}
  
    {paymentMethod ? (
      <section className="tracking-payment-method">
        <h2>Mode de paiement</h2>
        <p>{paymentMethod === 'card' ? 'Carte Bancaire' : paymentMethod === 'paypal' ? 'PayPal' : paymentMethod}</p>
      </section>
    ) : (
      <p className="info-placeholder">Aucun mode de paiement sélectionné.</p>
    )}
  
    {orderDetails ? (
      <section className="tracking-order-details">
        <h2>Détails de la commande</h2>
        <p><strong>Statut :</strong> {orderDetails.order?.status || 'Statut non disponible'}</p>
        <p><strong>Date :</strong> {formatDate(orderDetails.order?.created_at)}</p>
  
        <h3>Produits :</h3>
        {Array.isArray(orderDetails.items) && orderDetails.items.length > 0 ? (
          <ul className="product-list">
            {orderDetails.items.map((item, idx) => (
              <li key={item.id || idx} className="product-item">
                <strong>{item.product_name}</strong> — Quantité : {item.quantity} — Prix total : {item.total_price} €
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun produit dans cette commande.</p>
        )}
      </section>
    ) : (
      <p className="info-placeholder">Détails de la commande non disponibles.</p>
    )}
  
    <Link to="/" className="back-link">
      ← Retour à l'accueil
    </Link>
  </div>
  
  );
};

export default OrderTracking;
