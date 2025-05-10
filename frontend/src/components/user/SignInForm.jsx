import React, { useContext, useState } from "react";
import api from "../../api";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function SignInForm({ toggleModal }) {
  const { setIsAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Tentative de connexion avec :", { username, password });

    try {
      const response = await api.post("token/", { username, password });
      const { access, refresh } = response.data;

      console.log("Token reçu :", { access, refresh });

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      setIsAuthenticated(true);

      // Facultatif : récupérer le prénom
      try {
        const userRes = await fetch("http://localhost:8001/get_username", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
        });

        console.log("Réponse de /get_username :", userRes);

        if (userRes.ok) {
          const userData = await userRes.json();
          console.log("Prénom récupéré :", userData.first_name);
        } else {
          const errorText = await userRes.text();
          console.warn("Impossible de récupérer le prénom :", errorText);
        }
      } catch (err) {
        console.error("Erreur prénom :", err);
      }

      setUsername("");
      setPassword("");

      // 🔒 Ferme la modal après connexion réussie
      toggleModal();

      const from = location.state?.from?.pathname || "/";
      console.log("Redirection vers :", from);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Erreur lors de la connexion :", err);
      if (err.response) {
        console.error("Détails de l'erreur :", err.response.data);
      }
      setError("Nom d'utilisateur ou mot de passe incorrect.");
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
}

export default SignInForm;
