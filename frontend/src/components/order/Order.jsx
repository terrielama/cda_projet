import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link pour le lien de suivi
import PaiementForm from './PaymentForm';

const Order = () => {
  // Récupération de l'ID de la commande depuis l'URL
  const { orderId } = useParams();

  // États React pour gérer les données, chargement, erreurs, paiement et utilisateur
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [userName, setUserName] = useState({ first_name: null, last_name: null });

  // --- Effet pour récupérer les détails de la commande via l'API ---
  useEffect(() => {
    if (!orderId) return; // Stop si pas d'orderId

    const fetchOrder = async () => {
      console.log(`⏳ Récupération de la commande ID = ${orderId}`);
      try {
        const res = await fetch(`http://localhost:8001/order/${orderId}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`Erreur API ${res.status}`);

        const data = await res.json();

        // Assurer que data.items est un tableau (parfois peut être objet)
        if (!Array.isArray(data.items)) {
          console.warn(`"items" n'est pas un tableau, conversion en tableau...`);
          data.items = data.items ? Object.values(data.items) : [];
        }

        setOrderDetails(data);
        console.log('✅ Commande récupérée:', data);
      } catch (err) {
        console.error('❌ Erreur récupération commande:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // --- Effet pour récupérer les infos utilisateur connecté via token dans localStorage ---
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('⚠️ Pas de token, utilisateur non connecté.');
      return;
    }

    fetch('http://localhost:8001/get_username', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('401 Unauthorized');
        return res.json();
      })
      .then(data => {
        console.log('👤 Utilisateur connecté:', data);
        setUserName({ first_name: data.first_name, last_name: data.last_name });
      })
      .catch(err => {
        console.warn('⚠️ Impossible de récupérer utilisateur:', err);
        setUserName({ first_name: null, last_name: null });
      });
  }, []);

  // --- Effet pour associer la commande à l'utilisateur si les deux existent ---
  useEffect(() => {
    if (!userName.first_name || !orderDetails) return; // Pas assez d'infos

    const associateUserToOrder = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.warn('⚠️ Pas de token pour associer commande.');
          return;
        }

        console.log(`🔗 Association utilisateur à commande ${orderId}`);
        const res = await fetch('http://localhost:8001/associate_user_to_order/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId }),
        });

        if (!res.ok) throw new Error(`Erreur API ${res.status}`);

        console.log('✅ Utilisateur associé à la commande');
      } catch (err) {
        console.error('❌ Erreur association utilisateur/commande:', err);
      }
    };

    associateUserToOrder();
  }, [userName, orderDetails, orderId]);

  // --- Gestion des états de rendu ---

  // Affiche un message de chargement tant que les données ne sont pas récupérées
  if (loading) return <div>Chargement...</div>;

  // Affiche l'erreur si la récupération a échoué
  if (error) return <div style={{ color: 'red' }}>Erreur : {error}</div>;

  // Cas où aucune commande n'a été trouvée
  if (!orderDetails) return <div>Aucune commande trouvée.</div>;

  // Extraction des données nécessaires
  const { items = [], order = {} } = orderDetails;

  // Détermine si l'utilisateur est un invité (pas de nom récupéré et pas d'utilisateur associé)
  const isGuest =
    !userName.first_name &&
    (!order.user || !order.user.first_name);

  // Calcul du montant total de la commande
  const totalAmount = items.length
    ? items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0).toFixed(2)
    : '0.00';

  return (
    <div className="order-page" style={{ padding: 20 }}>
      <h1>Détails de la commande #{order.id || orderId}</h1>

      {/* Résumé de la commande */}
      <div className="order-summary" style={{ marginBottom: 30 }}>
        <p>
          <strong>Client :</strong>{' '}
          {userName.first_name
            ? `${userName.first_name} ${userName.last_name}`
            : isGuest
            ? 'Invité'
            : 'Utilisateur inscrit'}
        </p>

        {/* Liste des articles commandés */}
        <div className="order-items">
          {items.length === 0 ? (
            <p>Aucun produit dans cette commande.</p>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id || index}
                className="order-item"
                style={{ display: 'flex', marginBottom: '10px', alignItems: 'center' }}
              >
                <img
                  src={`http://localhost:8001${item.product_image || '/default-image.jpg'}`}
                  alt={item.product_name || 'Produit'}
                  style={{ width: 100, height: 100, objectFit: 'cover', marginRight: 10 }}
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = '/default-image.jpg';
                  }}
                />
                <div className="order-text">
                  <h4>{item.product_name || 'Produit sans nom'}</h4>
                  <p>
                    Quantité : {item.quantity || 1} | Prix unitaire : {item.price || 0}€ | Total :{' '}
                    {item.total_price || 0}€
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total à payer */}
        <div className="order-total" style={{ marginTop: 20 }}>
          <h3>Total à payer : {totalAmount} €</h3>
        </div>
      </div>

      {/* Choix du mode de paiement */}
      <div className="payment-method">
        <h2>Choisissez votre mode de paiement</h2>
        <button
          onClick={() => {
            console.log('💳 Paiement sélectionné : Carte Bancaire');
            setSelectedPayment('card');
          }}
          style={{ marginRight: 10 }}
        >
          Carte Bancaire
        </button>
        <button
          onClick={() => {
            console.log('💸 Paiement sélectionné : PayPal');
            setSelectedPayment('paypal');
          }}
        >
          PayPal
        </button>

        {/* Affichage du mode de paiement sélectionné */}
        {selectedPayment && (
          <p style={{ marginTop: 10 }}>
            Vous avez choisi :{' '}
            <strong>{selectedPayment === 'card' ? 'Carte Bancaire' : 'PayPal'}</strong>
          </p>
        )}

        {/* Affichage conditionnel du formulaire de paiement */}
        {selectedPayment === 'card' && <PaiementForm />}
      </div>

      {/* --- Lien pour suivre la commande --- */}
      <div style={{ marginTop: 40 }}>
        <Link
          to={`/orderTracking/${orderId}`}
          onClick={() => console.log(`➡️ Suivi commande demandé pour ID ${orderId}`)}
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 5,
            fontWeight: 'bold',
          }}
        >
          Suivre ma commande
        </Link>
      </div>
    </div>
  );
};

export default Order;
