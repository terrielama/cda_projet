import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import LoaderTracking from './LoaderTracking';

const Order = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [userName, setUserName] = useState({ first_name: null, last_name: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError('Identifiant de commande manquant');
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:8001/order/${orderId}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error(`Erreur API ${res.status}`);

        const data = await res.json();
        if (!Array.isArray(data.items)) {
          data.items = data.items ? Object.values(data.items) : [];
        }

        setOrderDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

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
        setUserName({ first_name: data.first_name, last_name: data.last_name });
      })
      .catch(() => {
        setUserName({ first_name: null, last_name: null });
      });
  }, []);

  useEffect(() => {
    if (!userName.first_name || !orderDetails) return;

    const associateUserToOrder = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        await fetch('http://localhost:8001/associate_user_to_order/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId }),
        });
      } catch (err) {
        console.error('Erreur association utilisateur/commande:', err);
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

    setIsSubmitting(true);

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
        throw new Error(`Erreur API ${res.status}: ${errText}`);
      }

      const result = await res.json();
      console.log('Mise à jour commande réussie:', result);

      // Afficher le loader avant de naviguer
      setTimeout(() => {
        navigate(`/orderTracking/${orderId}`, {
          state: { clientInfo: formData, paymentMethod: selectedPayment, orderDetails },
        });
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la mise à jour commande:', err);
      alert('Erreur lors de l’enregistrement des informations. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (isSubmitting) return <LoaderTracking />;
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
            <div key={item.id || index} className="order-item" style={{ display: 'flex', marginBottom: '10px' }}>
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

      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
        <h2>Informations client</h2>

        <label>Prénom :<br />
          <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
        </label>

        <br /><label>Nom :<br />
          <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
        </label>

        <br /><label>Adresse :<br />
          <input type="text" name="address" value={formData.address} onChange={handleInputChange} required />
        </label>

        <br /><label>Téléphone :<br />
          <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
        </label>

        <br /><label>Mode de paiement :<br />
          <select value={selectedPayment} onChange={e => setSelectedPayment(e.target.value)} required>
            <option value="">-- Choisissez un mode --</option>
            <option value="CB">Carte bancaire</option>
            <option value="PP">PayPal</option>
          </select>
        </label>

        <br /><br />
        <button type="submit" style={{ padding: '10px 20px' }}>
          Confirmer la commande
        </button>
      </form>

      <Link to="/">Retour à l'accueil</Link>
    </div>
  );
};

export default Order;
