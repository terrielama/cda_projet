import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from './BackButton'; // Composant bouton de retour personnalisé

const OrderTracking = () => {
  const { trackingCode } = useParams();
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!trackingCode) return;

    const fetchTracking = async () => {
      try {
        const res = await fetch(`http://localhost:8001/order/tracking/${trackingCode}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`Erreur API ${res.status}`);

        const data = await res.json();
        setTrackingInfo(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [trackingCode]);

  if (loading)
    return (
      <div className="order-tracking-container">
        <div className="spinner"></div>
        <p>Chargement des infos de suivi...</p>
      </div>
    );

  if (error) return <div className="order-tracking-container error">Erreur : {error}</div>;
  if (!trackingInfo) return <div className="order-tracking-container">Aucune information de suivi trouvée.</div>;

  return (
    <div className="order-tracking-container">
      <h1>Suivi de la commande : {trackingCode}</h1>

      {/* Informations utilisateur */}
      <div className="order-user-info">
        <h2>Informations client</h2>
        <p><strong>Nom :</strong> {trackingInfo.user.first_name} {trackingInfo.user.last_name}</p>
        <p><strong>Email :</strong> {trackingInfo.user.email}</p>
      </div>

      {/* Détails de la commande */}
      <div className="order-details">
        <h2>Détails de la commande</h2>
        <p><strong>Statut :</strong> {trackingInfo.status}</p>
        <p><strong>Méthode de paiement :</strong> {trackingInfo.payment_method || "Non renseignée"}</p>
        <p><strong>Date de commande :</strong> {new Date(trackingInfo.created_at).toLocaleString()}</p>
        <p><strong>Dernière mise à jour :</strong> {new Date(trackingInfo.updated_at).toLocaleString()}</p>
        <p><strong>Code panier :</strong> {trackingInfo.cart_code}</p>
      </div>

      {/* Produits commandés */}
      <div className="order-products">
        <h2>Produits commandés</h2>
        {trackingInfo.items && trackingInfo.items.map((item, idx) => (
          <div key={idx} className="product-item">
            <div>
              <p><strong>{item.product_name}</strong></p>
              <p>Quantité : {item.quantity}</p>
              <p>Prix unitaire : {item.product_price} €</p>
              <p>Total : {item.total_price} €</p>
            </div>
          </div>
        ))}
      </div>

      {/* Étapes de livraison */}
      {trackingInfo.steps && (
        <div className="order-steps">
          <h2>Étapes de livraison</h2>
          <ul>
            {trackingInfo.steps.map((step, idx) => (
              <li key={idx}>
                {step.date} - {step.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bouton Retour à la commande */}
      <div className="order-tracking-back">
      <BackButton />
      </div>
    </div>
  );
};

export default OrderTracking;
