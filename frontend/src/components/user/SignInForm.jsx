import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"; // Instance axios avec baseURL déjà configurée

const AuthModal = ({ toggleModal }) => {
  const [isLogin, setIsLogin] = useState(true); // true = Connexion, false = Inscription
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

  // Gère les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gère la soumission du formulaire (connexion ou inscription)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Formulaire soumis");

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      console.log("Erreur: Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      let response;

      if (isLogin) {
        console.log("Tentative de connexion avec les données:", formData);
        response = await api.post("token/", {
          username: formData.username,
          password: formData.password,
        });
      } else {
        const { confirmPassword, ...dataToSend } = formData;
        console.log("Tentative d'inscription avec les données:", dataToSend);
        response = await api.post("register/", dataToSend);
      }

      const { access, refresh } = response.data;
      console.log("Tokens reçus:", { access, refresh });

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // Vérifiez si le cart_code existe dans le localStorage
      const cart_code = localStorage.getItem("cart_code");
      if (cart_code && access) {
        console.log("Tentative d'associer le panier avec cart_code:", cart_code);

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
          console.log("Panier associé avec succès:", cartResponse.data);
        } catch (cartError) {
          console.error("Erreur d'association du panier:", cartError.response?.data);
          setError("Erreur lors de l'association du panier.");
        }
      } else {
        console.log("Aucun cart_code trouvé dans localStorage ou pas de token d'accès.");
      }

      toggleModal();
    } catch (err) {
      console.error("Erreur backend : ", err.response?.data);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        "Erreur. Veuillez vérifier les champs."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-btn" onClick={toggleModal}>X</button>
        <h2>{isLogin ? "Connexion" : "Inscription"}</h2>

        <form onSubmit={handleSubmit} className="form-grid">

          {/* Champs visibles uniquement en mode inscription */}
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

          {/* Champ commun : nom d'utilisateur */}
          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChange={handleChange}
            required
          />

          {/* Mot de passe */}
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {/* Confirmation du mot de passe en inscription */}
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

        {/* Lien pour basculer entre inscription et connexion */}
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
