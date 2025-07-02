import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';

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

  // Récupération des détails de la commande
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError('Identifiant de commande manquant');
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/order/${orderId}`);

        // S’assurer que items est un tableau
        if (!Array.isArray(data.items)) {
          data.items = data.items ? Object.values(data.items) : [];
        }

        setOrderDetails(data);

        // Pré-remplir le formulaire si données client présentes
        setFormData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          address: data.address || '',
          phone: data.phone || '',
        });

        setSelectedPayment(data.payment_method || '');
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Récupération des infos utilisateur connecté
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUserName({ first_name: null, last_name: null });
      return;
    }

    const fetchUser = async () => {
      try {
        const { data } = await api.get('get_username', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName({ first_name: data.first_name, last_name: data.last_name });
      } catch {
        setUserName({ first_name: null, last_name: null });
      }
    };

    fetchUser();
  }, []);

  // Gestion des changements dans le formulaire
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validation avant soumission
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

  // Soumission du formulaire
  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await api.post(
        `order/${orderId}/update_client_info/`,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address: formData.address,
          phone: formData.phone,
          payment_method: selectedPayment,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        }
      );

      navigate(`/orderTracking/${orderId}`, {
        state: { clientInfo: formData, paymentMethod: selectedPayment, orderDetails },
      });
    } catch (err) {
      alert(
        err.response?.data
          ? 'Erreur : ' + JSON.stringify(err.response.data)
          : "Erreur lors de l'enregistrement des informations. Veuillez réessayer."
      );
      console.error('Erreur mise à jour commande:', err);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: 'red' }}>Erreur : {error}</div>;

  if (!orderDetails || !orderDetails.items || orderDetails.items.length === 0)
    return <div>Détails de la commande non disponibles.</div>;

  const { items = [], id: orderIdFromData, user } = orderDetails;
  const isGuest = !userName.first_name && (!user || !user.first_name);
  const totalAmount = items.reduce(
    (sum, item) => sum + parseFloat(item.total_price || 0),
    0
  ).toFixed(2);

  return (
    <div className="order-page" style={{ padding: 20 }}>
      <h1>Détails de la commande #{orderIdFromData || orderId}</h1>

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
              style={{ display: 'flex', marginBottom: 10, alignItems: 'center' }}
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
                  {item.product_price || 0}€ | Total : {item.total_price || 0}€
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

        <div style={{ marginBottom: 10 }}>
          <label>
            Prénom : <br />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              placeholder="Votre prénom"
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
              placeholder="Votre nom"
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
              placeholder="Votre adresse"
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
              placeholder="Votre numéro de téléphone"
            />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Mode de paiement : <br />
            <select
              value={selectedPayment}
              onChange={e => setSelectedPayment(e.target.value)}
              required
            >
              <option value="">-- Choisir un mode --</option>
              <option value="CB">Carte bancaire</option>
              <option value="PP">PayPal</option>
            </select>
          </label>
        </div>

        <button type="submit">Confirmer la commande</button>
      </form>

      <Link to="/">Retour à l'accueil</Link>
    </div>
  );
};

export default Order;
