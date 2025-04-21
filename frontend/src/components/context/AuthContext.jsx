import React, { createContext, useContext, useState, useEffect } from "react";

// Création du contexte d'authentification
const AuthContext = createContext();

// Provider qui englobe l'application et gère l'état d'authentification
export const AuthProvider = ({ children }) => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  // Vérifie si un token est présent dans le localStorage au chargement
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsUserLoggedIn(true);
    }
  }, []);

  // Fonction de connexion
  const login = () => {
    setIsUserLoggedIn(true);
  };

  // Fonction de déconnexion (sans navigation)
  const logout = () => {
    localStorage.removeItem("access_token"); // Supprime le token
    setIsUserLoggedIn(false); // Met à jour l'état
  };

  return (
    <AuthContext.Provider value={{ isUserLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser l'authentification facilement
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
