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
    console.log('location.state:', location.state);
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

  const displayPaymentMethod = (method) => {
    switch (method) {
      case 'credit_card':
        return 'Carte Bancaire';
      case 'paypal':
        return 'PayPal';
      default:
        return method || 'Non spécifié';
    }
  };

  const totalOrderPrice = orderDetails && Array.isArray(orderDetails.items)
    ? orderDetails.items.reduce((sum, item) => sum + (item.total_price || 0), 0)
    : 0;

  if (loading) return <div className="ordertracking-container">Chargement...</div>;
  if (error) return <div className="ordertracking-container" style={{ color: 'red' }}>Erreur : {error}</div>;

  return (
    <div className="ordertracking-container">
      <h1 className="ordertracking-title">Suivi de la commande #{orderId}</h1>

      {/* Infos client */}
      {clientInfo ? (
        <section className="ordertracking-section">
          <h2>Informations client</h2>
          <p className="ordertracking-paragraph"><strong>Prénom :</strong> {clientInfo.firstName}</p>
          <p className="ordertracking-paragraph"><strong>Nom :</strong> {clientInfo.lastName}</p>
          <p className="ordertracking-paragraph"><strong>Adresse :</strong> {clientInfo.address}</p>
          <p className="ordertracking-paragraph"><strong>Ville :</strong> {clientInfo.city}</p>
          <p className="ordertracking-paragraph"><strong>Pays :</strong> {clientInfo.country}</p>
          <p className="ordertracking-paragraph"><strong>Téléphone :</strong> {clientInfo.phone}</p>
        </section>
      ) : (
        <p className="ordertracking-paragraph" style={{ color: 'gray' }}>Aucune information client disponible.</p>
      )}

      {/* Mode de paiement */}
      {paymentMethod ? (
        <section className="ordertracking-section">
          <h2>Mode de paiement</h2>
          <p className="ordertracking-paragraph">{displayPaymentMethod(paymentMethod)}</p>
        </section>
      ) : (
        <p className="ordertracking-paragraph" style={{ color: 'gray' }}>Aucun mode de paiement sélectionné.</p>
      )}

      {/* Détails de la commande */}
      {orderDetails ? (
        <section className="ordertracking-section">
          <h2>Détails de la commande</h2>
          <p className="ordertracking-paragraph"><strong>Statut :</strong> {orderDetails.order?.status || 'Statut non disponible'}</p>
          <p className="ordertracking-paragraph"><strong>Date :</strong> {formatDate(orderDetails.order?.created_at)}</p>

          <h3>Produits :</h3>
          {Array.isArray(orderDetails.items) && orderDetails.items.length > 0 ? (
            <>
              <ul className="ordertracking-product-list">
                {orderDetails.items.map((item, idx) => (
                  <li key={item.id || idx} className="ordertracking-product-item">
                    <strong>{item.product_name}</strong> — Quantité : {item.quantity} — Prix total : {item.total_price} €
                  </li>
                ))}
              </ul>
              <p className="ordertracking-total"><strong>Total de la commande :</strong> {totalOrderPrice} €</p>
            </>
          ) : (
            <p className="ordertracking-paragraph">Aucun produit dans cette commande.</p>
          )}
        </section>
      ) : (
        <p className="ordertracking-paragraph" style={{ color: 'gray' }}>Détails de la commande non disponibles.</p>
      )}

      <Link to="/" className="ordertracking-link-back">
        ← Retour à l'accueil
      </Link>
    </div>
  );
};

export default OrderTracking;