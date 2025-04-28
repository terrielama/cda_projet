import React, { useContext, useState } from 'react'
import api from "../../api";
import { useLocation, useNavigate } from 'react-router-dom';
import {AuthContext} from "../context/AuthContext"

function SignInForm({ toggleModal }) {

  const {setIsAuthenticated} = useContext(AuthContext)

  const location = useLocation()
  const navigate = useNavigate()

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState (false);
  const [error, setError] = useState("");

  const userInfo = { username, password };

  // Fonction pour la connexion
  function handleSubmit(e) {
    e.preventDefault(); // Empêche le comportement par défaut du formulaire (rafraîchissement de la page)
    setLoading(true)

    api.post("token/", userInfo)
      .then(res => {
        console.log(res.data); // Log des données de réponse
        localStorage.setItem("access",res.data.access)
        localStorage.setItem("refresh",res.data.refresh)
        setUsername("")
        setPassword("")
        setLoading(false)
        setIsAuthenticated(true)
        get_username()
        setError("")

        const from = location.state.from.pathname || "/";
        navigate(from, {replace:true})

      })
      .catch(err => {
        console.log(err.message); // Log des erreurs
        setError(err.message)
        setLoading(false)
      });
  }




  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-btn" onClick={toggleModal}>
          X
        </button>
        <div>
          <h2>Connexion</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label>Username</label>
              <input
                type="text"
                placeholder="Votre username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Mot de passe</label>
              <input
                type="password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} >Se connecter</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignInForm;
