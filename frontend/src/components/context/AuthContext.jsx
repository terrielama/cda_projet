import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../../api"; // Assure-toi que l'importation de ton API est correcte.

export const AuthContext = createContext();

// Le AuthProvider permet de gérer l'état d'authentification
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");

  // Vérifie si l'utilisateur est authentifié en validant le token
  const handleAuth = () => {
    const token = localStorage.getItem("access");
    if (token) {
      const decoded = jwtDecode(token);
      const expiry_date = decoded.exp;
      const current_time = Date.now() / 1000;
      if (expiry_date >= current_time) {
        setIsAuthenticated(true);
      }
    }
  };

  // Récupère le nom d'utilisateur si authentifié
  function get_username() {
    api
      .get("get_username")
      .then((res) => {
        setUsername(res.data.username);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  useEffect(() => {
    handleAuth();
    if (isAuthenticated) {
      get_username();
    }
  }, [isAuthenticated]); // L'effet se réexécute lorsque isAuthenticated change

  // Objet à partager via le contexte
  const authValue = {
    isAuthenticated,
    setIsAuthenticated,
    username,
    get_username,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour accéder facilement au contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
