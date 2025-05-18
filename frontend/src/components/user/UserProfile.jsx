import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Hook d'auth personnalisé
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../user/LogoutButton'; // Composant bouton logout stylisé

const UserProfile = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Utilisateur non connecté.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:8001/user/orders/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Erreur API orders: status ${res.status} - body: ${errorText}`);
          throw new Error(`Erreur lors du chargement des commandes (code ${res.status})`);
        }

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des commandes :', err);
        setError(err.message || 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <div>Chargement…</div>;
  if (error) return <div style={{ color: 'red' }}>Erreur : {error}</div>;

  return (
    <div className="prf">
      <h1 className="prf-title">Mon profil</h1>

      <div className="prf-user">
        <p><strong>Nom :</strong> {user?.last_name || '—'}</p>
        <p><strong>Prénom :</strong> {user?.first_name || '—'}</p>
      </div>

      <h2 className="prf-subtitle">Mes commandes :</h2>
      {orders.length === 0 ? (
        <p className="prf-empty">Aucune commande trouvée.</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="prf-order">
            <h3 className="prf-order-title">Commande #{order.id}</h3>
            <p><strong>Status :</strong> {order.status}</p>
            <p>
              <strong>Date de création :</strong>{' '}
              {new Date(order.created_at).toLocaleString('fr-FR')}
            </p>
            <p><strong>Méthode de paiement :</strong> {order.payment_method || 'N/A'}</p>
            <ul className="prf-items">
              {order.items.map((item, idx) => (
                <li key={item.id ?? idx}>
                  {item.name ? `${item.name} — ` : ''}Prix total : {item.total_price} €
                </li>
              ))}
            </ul>
          </div>
        ))
      )}

      <LogoutButton onLogout={handleLogout} />
    </div>
  );
};

export default UserProfile;
