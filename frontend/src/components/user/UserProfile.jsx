import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Hook d'auth personnalisé
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../user/LogoutButton'; // Composant bouton logout stylisé

const UserProfile = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth(); // récupération du user et de la fonction logout
  const navigate = useNavigate();

  // 🔁 Au chargement du composant : on va chercher les commandes de l'utilisateur
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log("Pas de token d'accès, utilisateur non connecté.");
      setError('Utilisateur non connecté.');
      setLoading(false);
      return;
    }

    // Appel API pour récupérer les commandes
    fetch('http://localhost:8001/user/orders/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement des commandes');
        return res.json();
      })
      .then(data => {
        console.log('Commandes récupérées:', data);
        setOrders(data);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération des commandes :", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔒 Fonction de déconnexion appelée par LogoutButton
  const handleLogout = () => {
    console.log("Déconnexion en cours...");
    logout(); // Exécute la logique de déconnexion (suppression du token, etc.)
    console.log('Déconnexion réussie ! 👋'); 
    console.log("Utilisateur déconnecté, redirection vers la page d'accueil.");
    navigate('/'); // Redirige vers la home
  };

  // ⌛ Affichage conditionnel selon l’état de chargement ou erreur
  if (loading) return <div>Chargement…</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="prf">
      <h1 className="prf-title">Mon profil</h1>

      {/* Informations utilisateur */}
      <div className="prf-user">
        <p><strong>Nom :</strong> {user?.last_name || '—'}</p>
        <p><strong>Prénom :</strong> {user?.first_name || '—'}</p>
      </div>

      {/* Liste des commandes */}
      <h2 className="prf-subtitle">Mes commandes :</h2>
      {orders.length === 0 ? (
        <p className="prf-empty">Aucune commande trouvée.</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="prf-order">
            <h3 className="prf-order-title">Commande #{order.id}</h3>
            <p><strong>Status :</strong> {order.status}</p>
            <p><strong>Date de création :</strong> {new Date(order.created_at).toLocaleString()}</p>
            <p><strong>Méthode de paiement :</strong> {order.payment_method || 'N/A'}</p>
            <ul className="prf-items">
              {order.items.map((item, idx) => (
                <li key={idx}>Prix total : {item.total_price} €</li>
              ))}
            </ul>
          </div>
        ))
      )}

      {/* Bouton de déconnexion personnalisé avec animation */}
      <LogoutButton onLogout={handleLogout} />
    </div>
  );
};

export default UserProfile;
