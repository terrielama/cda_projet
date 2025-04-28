// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState } from 'react';

// Créer le contexte d'authentification
const AuthContext = createContext();

// Créer un provider pour gérer l'état global d'authentification
export const AuthProvider = ({ children }) => {
  // État pour suivre si l'utilisateur est connecté
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  // Fonction pour se connecter
  const login = () => {
    setIsUserLoggedIn(true);
  };

  // Fonction pour se déconnecter
  const logout = () => {
    setIsUserLoggedIn(false);
  };

  return (
    // Fournir le contexte avec les valeurs nécessaires
    <AuthContext.Provider value={{ isUserLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Créer un hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
