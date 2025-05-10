import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");

  // Vérifie la validité du token
  const checkAuth = () => {
    const token = localStorage.getItem("access_token"); // ici on lit bien 'access_token'
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const expiry = decoded.exp;
        const now = Date.now() / 1000;
        if (expiry >= now) {
          setIsAuthenticated(true);
          return true;
        }
      } catch (error) {
        console.error("Token invalide :", error);
      }
    }
    setIsAuthenticated(false);
    return false;
  };

  // Récupère le nom d'utilisateur
  const get_username = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const res = await api.get("get_username", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("User récupéré dans AuthContext :", res.data);
      setUsername(res.data.username);
    } catch (err) {
      console.error("Erreur lors de la récupération du user dans AuthContext :", err);
    }
  };

  // Vérifie l'authentification au démarrage
  useEffect(() => {
    const isValid = checkAuth();
    if (isValid) {
      get_username();
    }
  }, []);

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
