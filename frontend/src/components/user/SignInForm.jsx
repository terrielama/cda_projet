import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"; // axios instance bien configurée avec baseURL

const SignInForm = ({ toggleModal }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Authentification - récupération du token
      const response = await api.post("token/", { username, password });
      const { access, refresh } = response.data;

      console.log("Token reçu :", { access, refresh });

      // 2. Sauvegarde dans le localStorage
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // 3. Associer un panier si cart_code existe déjà
      const cart_code = localStorage.getItem("cart_code");
      if (cart_code) {
        await api.post(
          "associate_cart_to_user/",
          { cart_code },
          {
            headers: {
              Authorization: `Bearer ${access}`,
            },
          }
        );
        console.log("Panier associé à l'utilisateur");
      }

      // 4. Fermer le modal
      toggleModal();

      // 5. Redirection si souhaitée
      // navigate("/mon-compte"); // facultatif

    } catch (err) {
      console.error(err);
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
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
