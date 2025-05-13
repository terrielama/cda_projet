import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"; // Assurez-vous que l'API est bien configurée pour les appels backend

const SignInForm = ({ toggleModal }) => { // Assurez-vous de passer toggleModal en prop
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Ajout de l'état de chargement
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Démarrer le chargement

    try {
      // Envoyer les informations de connexion à l'API pour récupérer le token
      const response = await api.post("token/", { username, password });
      const { access, refresh, user_id } = response.data;

      console.log("Token reçu :", { access, refresh });

      // Sauvegarder les tokens dans le localStorage
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // Fermer le modal de connexion
      toggleModal();

    } catch (err) {
      console.error(err);
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false); // Fin du chargement
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-btn" onClick={toggleModal}>
          X
        </button>
        <h2>Connexion</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <div>
            <label>Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Votre nom d'utilisateur"
              required
            />
          </div>
          <div>
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          {error && <p className="error-msg">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default SignInForm;
