import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"; // Instance Axios configurée

// Fonction utilitaire : convertit camelCase en snake_case
const camelToSnake = (str) =>
  str.replace(/([A-Z])/g, (letter) => `_${letter.toLowerCase()}`);

// Fonction utilitaire : convertit toutes les clés d'un objet en snake_case récursivement
const keysToSnakeCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(keysToSnakeCase);
  } else if (obj !== null && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[camelToSnake(key)] = keysToSnakeCase(value);
      return acc;
    }, {});
  }
  return obj;
};

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

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        console.error("Erreur : mots de passe différents.");
        setLoading(false);
        return;
      }
      if (formData.password.length < 8) {
        setError("Le mot de passe doit contenir au moins 8 caractères.");
        console.error("Erreur : mot de passe trop court.");
        setLoading(false);
        return;
      }
    }

    try {
      let response;

      if (isLogin) {
        response = await api.post("token/", {
          username: formData.username,
          password: formData.password,
        });
      } else {
        const { confirmPassword, ...rest } = formData;
        const dataToSend = keysToSnakeCase(rest);
        dataToSend.confirm_password = confirmPassword;

        response = await api.post("register/", dataToSend);
      }

      console.log("Réponse reçue complète :", response);
      console.log("response.data :", response.data);

      // Affiche toutes les clés de response.data pour vérifier
      console.log("Clés de response.data :", Object.keys(response.data));

      // Affichage tokens même s'ils sont undefined
      console.log("Token access reçu :", response.data.access);
      console.log("Token refresh reçu :", response.data.refresh);

      const { access, refresh } = response.data;

      if (access && refresh) {
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
        console.log("Tokens enregistrés dans le localStorage.");
      } else {
        console.warn("Tokens absents dans la réponse !");
      }

      const cart_code = localStorage.getItem("cart_code");
      if (cart_code && access) {
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
          console.error(
            "Erreur d'association du panier :",
            cartError.response?.data || cartError.message
          );
          setError("Erreur lors de l'association du panier.");
        }
      } else {
        console.log("Aucun cart_code trouvé ou access token manquant.");
      }

      toggleModal();
      console.log("Modal fermée.");
      

    } catch (err) {
      console.error("Erreur lors de la requête :", err.response?.data || err.message);
      const backendErrors = err.response?.data;
      if (backendErrors && backendErrors.detail === "No active account found with the given credentials") {
        setError("Aucun compte actif trouvé avec les identifiants donnés.");
      } else if (backendErrors) {
        const allErrors = Object.values(backendErrors).flat().join(" ");
        setError(allErrors || "Erreur. Veuillez vérifier les champs.");
      } else {
        setError("Erreur. Veuillez vérifier les champs.");
      }      
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

          <button className="submit" type="submit" disabled={loading}>
            {loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
          </button>

          {error && <div className="alert-error">{error}</div>}
        </form>

        <p className="switch-mode">
          {isLogin ? (
            <button type="button" onClick={() => setIsLogin(false)}>
              <hr />
              <p>Vous n'avez pas encore de compte ? </p> Inscrivez-vous !
            </button>
          ) : (
            <button type="button" onClick={() => setIsLogin(true)}>
              <hr /> Vous avez déjà un compte ? Connectez-vous !
            </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
