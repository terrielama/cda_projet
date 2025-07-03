import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import Loader from '../Loader';

const Order = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);     
  const [submitting, setSubmitting] = useState(false); 
  const [error, setError] = useState(null);

  const [selectedPayment, setSelectedPayment] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    country: '',
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
        const { data } = await api.get(`/order/${orderId}`);

        if (!Array.isArray(data.items)) {
          data.items = data.items ? Object.values(data.items) : [];
        }

        setOrderDetails(data);

        setFormData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
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

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { firstName, lastName, address, city, country, phone } = formData;
    if (!firstName || !lastName || !address || !city || !country || !phone) {
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

    setSubmitting(true); 

    try {
     
      await api.post(
        `order/${orderId}/update_client_info/`,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address: formData.address,
          phone: formData.phone,
          payment_method: selectedPayment,
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
      setSubmitting(false); 
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: 'red' }}>Erreur : {error}</div>;

  if (!orderDetails || !orderDetails.items || orderDetails.items.length === 0)
    return <div>Détails de la commande non disponibles.</div>;

  const { items = [], id: orderIdFromData } = orderDetails;
  const totalAmount = items
    .reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0)
    .toFixed(2);

 
    return (
      <div className="order-page" style={{ padding: 20 }}>
        <h1>Détails de la commande #{orderIdFromData || orderId}</h1>
    
        <div className="order-container">
          <div className="order-summary">
            <div className="order-items">
              {items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="order-item"
                >
                  <img
                    src={`http://localhost:8001${item.product_image || '/default-image.jpg'}`}
                    alt={item.product_name || 'Produit'}
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = '/default-image.jpg';
                    }}
                  />
                  <div className="order-text">
                    <h4>{item.product_name || 'Produit sans nom'}</h4>
                    <p>
                      Taille : {item.size || 'N/A'} | Quantité : {item.quantity || 1} | Prix unitaire :{' '}
                      {item.product_price || 0}€ 
                    </p>
                  </div>
                </div>
              ))}
            </div>
    
            <div className="order-total">
              <h3>Total à payer : {totalAmount} €</h3>
            </div>
          </div>
    
          <form onSubmit={handleSubmit} className="order-form">
            <h2>Informations client</h2>
    
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
    
            <label>
              Ville : <br />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                placeholder="Votre ville"
              />
            </label>
    
            <label>
              Pays : <br />
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                placeholder="Votre pays"
              />
            </label>
    
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
    
            <label>
              Mode de paiement : <br />
              <select
                value={selectedPayment}
                onChange={e => setSelectedPayment(e.target.value)}
                required
                disabled={submitting}
              >
                <option value="">-- Choisir un mode de paiement --</option>
                <option value="CB">Carte bancaire</option>
                <option value="PP">PayPal</option>
              </select>
            </label>
    
            <button type="submit" disabled={submitting}>
              Confirmer la commande
            </button>
            {submitting && <Loader />}
          </form>
        </div>
    
        <Link to="/">Retour à la boutique</Link>
      </div>
    );
    
};

export default Order;
