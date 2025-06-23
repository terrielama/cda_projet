import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const Order = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [userName, setUserName] = useState({ first_name: null, last_name: null });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    if (!orderId) {
      console.warn('orderId manquant dans les params URL');
      setLoading(false);
      setError('Identifiant de commande manquant');
      return;
    }

    const fetchOrder = async () => {
      console.log(`Récupération de la commande ID = ${orderId}`);
      try {
        const res = await fetch(`order/${orderId}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error(`Erreur API ${res.status}`);

        const data = await res.json();
        console.log('Données reçues de la commande:', data);

        // Affiche chaque produit avec son prix
        if (Array.isArray(data.items)) {
          data.items.forEach((item, i) => {
            console.log(`🛒 Produit #${i + 1} - ${item.product_name}`);
            console.log(`   → Prix unitaire: ${item.price}€`);
            console.log(`   → Quantité: ${item.quantity}`);
            console.log(`   → Total: ${item.total_price}€`);
          });
        }

        if (!Array.isArray(data.items)) {
          console.warn(`"items" n'est pas un tableau, conversion...`);
          data.items = data.items ? Object.values(data.items) : [];
        }

        setOrderDetails(data);
      } catch (err) {
        console.error('❌ Erreur récupération commande:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

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

  useEffect(() => {
    if (!userName.first_name || !orderDetails) return;

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

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { firstName, lastName, address, phone } = formData;
    if (!firstName || !lastName || !address || !phone) {
      alert('Veuillez remplir tous les champs du formulaire.');
      return false;
    }
    if (!selectedPayment) {
      alert('Veuillez choisir un mode de paiement.');
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) return;

    console.log('📤 Données formulaire à envoyer:', formData);
    console.log('💳 Mode de paiement sélectionné:', selectedPayment);

    try {
      const token = localStorage.getItem('access_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8001/order/${orderId}/update_client_info/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          address: formData.address,
          phone: formData.phone,
          payment_method: selectedPayment,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`Erreur API ${res.status}: ${errText}`);
        throw new Error(`Erreur API ${res.status}: ${errText}`);
      }

      const result = await res.json();
      console.log('✅ Mise à jour commande réussie:', result);

      navigate(`/orderTracking/${orderId}`, {
        state: { clientInfo: formData, paymentMethod: selectedPayment, orderDetails },
      });
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour commande:', err);
      alert('Erreur lors de l’enregistrement des informations. Veuillez réessayer.');
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: 'red' }}>Erreur : {error}</div>;

  if (!orderDetails || !orderDetails.items || orderDetails.items.length === 0)
    return <div>Détails de la commande non disponibles.</div>;

  const { items = [], order = {} } = orderDetails;
  const isGuest = !userName.first_name && (!order.user || !order.user.first_name);
  const totalAmount = items.length
    ? items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0).toFixed(2)
    : '0.00';

  return (
    <div className="order-page" style={{ padding: 20 }}>
      <h1>Détails de la commande #{order.id || orderId}</h1>

      <div className="order-summary" style={{ marginBottom: 30 }}>
        <p>
          <strong>Client :</strong>{' '}
          {userName.first_name
            ? `${userName.first_name} ${userName.last_name}`
            : isGuest
            ? 'Invité'
            : 'Utilisateur inscrit'}
        </p>

        <div className="order-items">
          {items.map((item, index) => (
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
                  Taille : {item.size || 'N/A'} | Quantité : {item.quantity || 1} | Prix unitaire :{' '}
                  {item.price || 0}€ | Total : {item.total_price || 0}€
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="order-total" style={{ marginTop: 20 }}>
          <h3>Total à payer : {totalAmount} €</h3>
        </div>
      </div>

      {/* Formulaire infos client */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
        <h2>Informations client</h2>

        <div style={{ marginBottom: 10 }}>
          <label>
            Prénom : <br />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Nom : <br />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Adresse : <br />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Téléphone : <br />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label>
            Mode de paiement : <br />
            <select
              value={selectedPayment}
              onChange={e => setSelectedPayment(e.target.value)}
              required
            >
              <option value="">-- Choisissez un mode --</option>
              <option value="CB">Carte bancaire</option>
              <option value="PP">PayPal</option>
            </select>
          </label>
        </div>

        <button type="submit" style={{ padding: '10px 20px' }}>
          Confirmer la commande
        </button>
      </form>

      <Link to="/">Retour à l'accueil</Link>
    </div>
  );
};

export default Order;
