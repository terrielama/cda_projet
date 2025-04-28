import React, { useState } from 'react'
import axios from 'axios'

function SignInForm({ toggleModal }) {
  const [isLoginForm, setIsLoginForm] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('') // État pour le message de succès

  // Fonction pour l'inscription
  const handleSignUp = async () => {
    if (!email || !password || !firstName || !lastName) {
      setError('Tous les champs sont requis.')
      return
    }

    try {
      const response = await axios.post('http://127.0.0.1:8001/signup/', {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      })
      console.log('User created successfully', response)
      setSuccessMessage(
        'Inscription réussie ! Vous pouvez maintenant vous connecter.'
      )
      setError('')
      setIsLoginForm(true) // Basculer automatiquement sur le formulaire de connexion
    } catch (err) {
      console.error('Error during signup', err)
      setError("Erreur lors de l'inscription")
      setSuccessMessage('')
    }
  }

  // Fonction pour la connexion
  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8001/login/', {
        email,
        password,
      })

      console.log('Connexion réussie', response)

      const { access_token, refresh_token } = response.data
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)

      setSuccessMessage('Connexion réussie !')
      setError('')

      window.location.href = '/'
    } catch (err) {
      console.error('Erreur lors de la connexion', err)
      if (err.response && err.response.data) {
        setError(err.response.data.error || 'Identifiants invalides')
      } else {
        setError('Une erreur est survenue lors de la connexion')
      }
      setSuccessMessage('')
    }
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-btn" onClick={toggleModal}>
          X
        </button>

        {isLoginForm ? (
          <div>
            <h2>Connexion</h2>
            <div className="form-grid">
              <div>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
            </div>
            <button onClick={handleLogin}>Se connecter</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {successMessage && (
              <p style={{ color: 'green' }}>{successMessage}</p>
            )}
            <button onClick={() => setIsLoginForm(false)}>
              Pas de compte ? Inscrivez-vous
            </button>
          </div>
        ) : (
          <div>
            <h2>Inscription</h2>
            <div className="form-grid">
              <div>
                <label>Nom</label>
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Prénom</label>
                <input
                  type="text"
                  placeholder="Votre prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
            </div>
            <button onClick={handleSignUp}>S'inscrire</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {successMessage && (
              <p style={{ color: 'green' }}>{successMessage}</p>
            )}
            <button onClick={() => setIsLoginForm(true)}>
              {successMessage
                ? 'Connectez-vous'
                : 'Vous avez déjà un compte ? Connectez-vous'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SignInForm
