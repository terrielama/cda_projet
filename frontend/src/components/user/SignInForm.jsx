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
  // State pour savoir si on est en mode connexion ou inscription
  const [isLogin, setIsLogin] = useState(true);

  // State pour les données du formulaire
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    email: "",
  });

  // State pour les erreurs et chargement
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Hook navigation (non utilisé ici mais prêt si besoin)
  const navigate = useNavigate();

  // Mise à jour des champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(`Champ ${name} mis à jour :`, value);
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le reload classique du formulaire
    setLoading(true); // Affiche l'état de chargement
    setError(""); // Réinitialise les erreurs
    console.log("Soumission du formulaire...");
    console.log("Mode :", isLogin ? "Connexion" : "Inscription");
    console.log("Données saisies :", formData);

    // Validation côté client si inscription
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
        // Connexion : envoi username & password
        console.log("Connexion avec :", {
          username: formData.username,
          password: formData.password,
        });

        response = await api.post("token/", {
          username: formData.username,
          password: formData.password,
        });
      } else {
        // Inscription : convertir en snake_case et exclure confirmPassword
        const { confirmPassword, ...rest } = formData;
        const dataToSend = keysToSnakeCase(rest);
        dataToSend.confirm_password = confirmPassword; // Ajouter à la main

        console.log("Inscription avec (snake_case):", dataToSend);

        response = await api.post("register/", dataToSend);
      }

      console.log("Réponse reçue :", response.data);
      const { access, refresh } = response.data;

      // Stocker tokens dans localStorage
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      console.log("Tokens enregistrés dans le localStorage.");

      // Gestion du panier si cart_code présent
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
          console.error(
            "Erreur d'association du panier :",
            cartError.response?.data || cartError.message
          );
          setError("Erreur lors de l'association du panier.");
        }
      } else {
        console.log("Aucun cart_code trouvé ou access token manquant.");
      }

      // Fermer la modal
      toggleModal();
      console.log("Modal fermée.");

      // Forcer le reload complet de la page après succès
      console.log("Forçage du reload complet de la page...");
      window.location.reload();

    } catch (err) {
      // Gestion des erreurs backend
      console.error("Erreur lors de la requête :", err.response?.data || err.message);
      const backendErrors = err.response?.data;
      if (backendErrors) {
        const allErrors = Object.values(backendErrors)
          .flat()
          .join(" ");
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
        {/* Bouton pour fermer la modal */}
        <button className="close-btn" onClick={toggleModal}>
          X
        </button>

        {/* Titre selon mode */}
        <h2>{isLogin ? "Connexion" : "Inscription"}</h2>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="form-grid">
          {/* Champs supplémentaires en inscription */}
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

          {/* Champs communs */}
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

          {/* Confirmation mot de passe en inscription */}
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

          {/* Bouton soumission */}
          <button className="submit" type="submit" disabled={loading}>
            {loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
          </button>

          {/* Affichage erreur */}
          {error && <p className="error-msg">{error}</p>}
        </form>

        {/* Switch entre connexion et inscription */}
        <p className="switch-mode">
        {isLogin ? (
          
          <button type="button" onClick={() => setIsLogin(false)}> <hr/> <p>Vous n'avez pas encore de compte ? </p>  Inscrivez-vous !
          </button>
        ) : (
          <button type="button" onClick={() => setIsLogin(true)}>
           <hr/> Vous avez déjà un compte ?  Connectez-vous !
          </button>
        )}
      </p>

      </div>
    </div>
  );
};

export default AuthModal;
