import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);  // on stocke tout l'objet utilisateur

  // Vérifie la validité du token
  const checkAuth = () => {
    const token = localStorage.getItem("access_token");
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

  // Récupère l'utilisateur connecté
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const res = await api.get("get_username", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Utilisateur connecté :", res.data);
      setUser(res.data);
    } catch (err) {
      console.error("Erreur lors de la récupération du user :", err);
    }
  };

  // Déconnexion simple
  const logout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    const isValid = checkAuth();
    if (isValid) {
      fetchUser();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, fetchUser, logout }}>
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
