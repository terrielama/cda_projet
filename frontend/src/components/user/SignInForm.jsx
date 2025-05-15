import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"; // Axios instance configurée

const AuthModal = ({ toggleModal }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    email: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(`Champ ${name} mis à jour :`, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    console.log("Soumission du formulaire...");
    console.log("Mode :", isLogin ? "Connexion" : "Inscription");
    console.log("Données saisies :", formData);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      console.error("Erreur : mots de passe différents.");
      setLoading(false);
      return;
    }

    try {
      let response;

      if (isLogin) {
        console.log("Connexion avec :", {
          username: formData.username,
          password: formData.password,
        });

        response = await api.post("token/", {
          username: formData.username,
          password: formData.password,
        });
      } else {
        const { confirmPassword, ...dataToSend } = formData;
        console.log("Inscription avec :", dataToSend);

        response = await api.post("register/", dataToSend);
      }

      console.log("Réponse reçue :", response.data);
      const { access, refresh } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      console.log("Tokens enregistrés dans le localStorage.");

      const cart_code = localStorage.getItem("cart_code");
      if (cart_code && access) {
        console.log("Cart_code trouvé :", cart_code);
        console.log("Association du panier en cours...");

        try {
          const cartResponse = await api.post(
            "associate_cart_to_user/",
            { cart_code },
            {
              headers: {
                Authorization: `Bearer ${access}`,
              },
            }
          );
          console.log("Panier associé avec succès :", cartResponse.data);
        } catch (cartError) {
          console.error("Erreur d'association du panier :", cartError.response?.data);
          setError("Erreur lors de l'association du panier.");
        }
      } else {
        console.log("Aucun cart_code trouvé ou access token manquant.");
      }

      toggleModal();
      console.log("Modal fermée.");
    } catch (err) {
      console.error("Erreur lors de la requête :", err.response?.data);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        "Erreur. Veuillez vérifier les champs."
      );
    } finally {
      setLoading(false);
      console.log("Fin du traitement du formulaire.");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-btn" onClick={toggleModal}>X</button>
        <h2>{isLogin ? "Connexion" : "Inscription"}</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          {!isLogin && (
            <>
              <input
                type="text"
                name="first_name"
                placeholder="Prénom"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="last_name"
                placeholder="Nom"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Adresse email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </>
          )}

          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmez le mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? "Chargement..."
              : isLogin
              ? "Se connecter"
              : "S'inscrire"}
          </button>

          {error && <p className="error-msg">{error}</p>}
        </form>

        <p style={{ marginTop: "1rem" }}>
          {isLogin ? (
            <>
              Pas encore de compte ?{" "}
              <button onClick={() => setIsLogin(false)}>S'inscrire</button>
            </>
          ) : (
            <>
              Vous avez déjà un compte ?{" "}
              <button onClick={() => setIsLogin(true)}>Se connecter</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
