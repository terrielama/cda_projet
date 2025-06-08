import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Pour navigation client-side
import axios from 'axios';
import AddButton2 from "./AddButton2.jsx";
import PreviousButton from "./PreviousButton.jsx";
import NextButton from "./NextButton.jsx";
import LikeButton from "./LikeButton.jsx";

// Instance Axios configurée pour communiquer avec le backend
const api = axios.create({
  baseURL: "http://127.0.0.1:8001/",
});

// Mapping des catégories front -> backend
const categoryMap = {
  planche: "Boards",
  trucks: "Trucks",
  grips: "Grips",
  roues: "Roues",
  sweats: "Sweats",
  chaussures: "Chaussures",
  bonnets: "Bonnets",
  ceintures: "Ceintures",
};

// Fonction pour générer un code alphanumérique aléatoire (ex: pour cart_code)
function generateRandomAlphanumeric(length = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
}

// Récupère les favoris depuis localStorage (objet avec productId : bool)
const getFavoritesFromStorage = () => {
  const stored = localStorage.getItem('favorites');
  return stored ? JSON.parse(stored) : {};
};

// Sauvegarde les favoris dans localStorage
const saveFavoritesToStorage = (favorites) => {
  localStorage.setItem('favorites', JSON.stringify(favorites));
};

const ProductDetail = () => {
  // Récupération params url (id produit + catégorie)
  const { id, category } = useParams();
  const navigate = useNavigate();

  // Etats React
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]); // produits suggérés par catégorie (optionnel)
  const [suggestions, setSuggestions] = useState([]); // suggestions spécifiques produit
  const [visibleSuggestions, setVisibleSuggestions] = useState([]); // suggestions visibles (affichage)
  const [inCart, setInCart] = useState({}); // tracking produits ajoutés panier
  const [message, setMessage] = useState(''); // messages utilisateur (ex: ajout panier)
  const [likeMessage, setLikeMessage] = useState(''); // messages pour like/unlike
  const [favorites, setFavorites] = useState(getFavoritesFromStorage()); // favoris local
  const [quantity, setQuantity] = useState(1); // quantité choisie
  const [size, setSize] = useState(''); // taille sélectionnée
  const [showDetails, setShowDetails] = useState(false); // toggle description produit

  // Création / récupération du cart_code dans localStorage au premier rendu
  const [cartCode] = useState(() => {
    let code = localStorage.getItem("cart_code");
    if (!code) {
      code = generateRandomAlphanumeric();
      localStorage.setItem("cart_code", code);
      console.log("Nouveau cart_code généré :", code);
    } else {
      console.log("Cart code existant utilisé :", code);
    }
    return code;
  });

  // Effet : Chargement du produit au changement d'id
  useEffect(() => {
    if (!id) {
      console.warn("Aucun ID produit reçu dans l'URL");
      return;
    }

    console.log("Chargement du produit avec ID :", id);

    api.get(`product/${id}/`)
      .then((res) => {
        setProduct(res.data);
        console.log("Produit chargé avec succès :", res.data);

        // Si le produit a des tailles, on sélectionne la première par défaut
        if (Array.isArray(res.data.sizes) && res.data.sizes.length > 0) {
          setSize(res.data.sizes[0]);
          console.log("Taille par défaut sélectionnée :", res.data.sizes[0]);
        } else {
          setSize('');
          console.log("Produit sans tailles disponibles");
        }
      })
      .catch((err) => {
        setProduct(null);
        console.error("Erreur récupération produit :", err);
      });
  }, [id]);

  // Effet : Chargement des suggestions basées sur le produit (par id)
  useEffect(() => {
    if (!id) {
      setSuggestions([]);
      setVisibleSuggestions([]);
      console.log("ID produit absent, suggestions spécifiques réinitialisées");
      return;
    }

    console.log("Chargement des suggestions spécifiques pour le produit ID :", id);

    api.get(`products/${id}/suggestions/`)
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setSuggestions(res.data);
          setVisibleSuggestions(res.data.slice(0, 4)); // afficher les 4 premiers
          console.log("Suggestions spécifiques produit chargées :", res.data);
        } else {
          setSuggestions([]);
          setVisibleSuggestions([]);
          console.log("Aucune suggestion spécifique pour ce produit");
        }
      })
      .catch(err => {
        console.error("Erreur chargement suggestions spécifiques produit :", err);
        setSuggestions([]);
        setVisibleSuggestions([]);
      });
  }, [id]);


  // Fonction pour ajouter le produit au panier via l'API
  const addToCart = () => {
    if (!product) {
      console.warn("Tentative ajout panier sans produit chargé");
      return;
    }

    console.log("Tentative ajout panier :", {
      cart_code: cartCode,
      item_id: product.id,
      quantity,
      size,
    });

    // Vérification taille sélectionnée si le produit a des tailles
    if (Array.isArray(product.sizes) && product.sizes.length > 0 && !size) {
      setMessage("Veuillez sélectionner une taille.");
      console.warn("Ajout panier annulé : taille non sélectionnée");
      return;
    }

    api.post("add_item", {
      cart_code: cartCode,
      item_id: product.id,
      quantity,
      size,
    })
      .then(() => {
        setMessage("Produit ajouté au panier !");
        setInCart(prev => ({ ...prev, [product.id]: true }));
        console.log("Produit ajouté au panier avec succès");
      })
      .catch(err => {
        setMessage("Erreur lors de l'ajout au panier.");
        console.error("Erreur ajout panier :", err);
      });
  };

  // Toggle favoris : ajoute ou enlève un produit des favoris
  const toggleFavorite = (productId) => {
    const updated = { ...favorites, [productId]: !favorites[productId] };
    setFavorites(updated);
    saveFavoritesToStorage(updated);
    setLikeMessage(updated[productId] ? "Produit liké !" : "Produit retiré des favoris.");
    console.log("Favoris mis à jour :", updated);

    // Efface le message like après 2 secondes
    setTimeout(() => setLikeMessage(''), 2000);
  };

  // Affiche la suggestion suivante dans la liste visible (rotation circulaire)
  const handleNext = () => {
    setVisibleSuggestions(prev => [...prev.slice(1), prev[0]]);
    console.log("Suggestion suivante affichée");
  };

  // Affiche la suggestion précédente dans la liste visible (rotation circulaire inverse)
  const handlePrev = () => {
    setVisibleSuggestions(prev => [prev[prev.length - 1], ...prev.slice(0, -1)]);
    console.log("Suggestion précédente affichée");
  };

  // Quand l'utilisateur clique sur une suggestion, on navigue vers son détail
  const handleSuggestionClick = (productId) => {
    console.log("Navigation vers produit suggéré ID :", productId);
    navigate(`/produit/${productId}`);
  };

  // Affichage loading si produit non chargé
  if (!product) return <div>Chargement du produit...</div>;

  // Formattage du prix (exemple, 2 décimales)
  const priceFormatted = Number(product.price).toFixed(2);

  console.log("Suggestions visibles actuellement :", visibleSuggestions);


  return (
    <div className="product-detail-container">
      <div className="product-detail-content">
        {/* Image du produit */}
        <div className="product-image">
          <img
            src={`http://127.0.0.1:8001${product.image}`}
            alt={product.name}
            className="img-fluid"
            onError={(e) => { e.target.src = "/default-image.jpg"; }}
          />
        </div>

        {/* Informations produit */}
        <div className="product-detail-info">
          <h2 className="product-detail-title">{product.name}</h2>
          <p>Prix : {priceFormatted} €</p>
          <p>Catégorie : {product.category}</p>

          {/* Sélecteur de taille */}
          <div className="product-detail-size-selector">
            <div className="size-buttons">
              <p>Taille :</p>
              {Array.isArray(product.sizes) && product.sizes.length > 0 ? (
                product.sizes.map((s, index) => (
                  <button
                    key={index}
                    className={`size-button ${size === s ? 'selected' : ''}`}
                    onClick={() => {
                      setSize(s);
                      console.log("Taille sélectionnée :", s);
                    }}
                  >
                    {s}
                  </button>
                ))
              ) : (
                <p>Aucune taille disponible</p>
              )}
            </div>
          </div>

          {/* Sélecteur de quantité */}
          <div className="product-detail-quantity-selector">
            <p>Quantité :</p>
            <div className="quantity-controls">
              <button onClick={() => {
                const newQty = Math.max(1, quantity - 1);
                setQuantity(newQty);
                console.log("Quantité diminuée à :", newQty);
              }}>-</button>
              <input
                type="number"
                value={quantity}
                min="1"
                max="99"
                onChange={(e) => {
                  const val = Math.max(1, Math.min(99, parseInt(e.target.value) || 1));
                  setQuantity(val);
                  console.log("Quantité saisie :", val);
                }}
              />
              <button onClick={() => {
                const newQty = Math.min(99, quantity + 1);
                setQuantity(newQty);
                console.log("Quantité augmentée à :", newQty);
              }}>+</button>

              {/* Bouton ajouter au panier */}
              <AddButton2 className="add-to-cart-button" onClick={() => {
                addToCart(product.id, size, quantity);
                console.log(`Ajout au panier: produit ${product.id}, taille ${size}, quantité ${quantity}`);
              }}>
                {inCart[product.id] ? "Déjà dans le panier" : "Ajouter au panier"}
              </AddButton2>
            </div>
          
          <div className="Like-button">
          {/* Bouton favoris */}
          <LikeButton
                    productId={product.id}
                    isLiked={favorites[product.id] || false}
                    toggleFavorite={toggleFavorite}
                  />
  </div>
        </div>  

          {/* Bouton afficher/masquer détails produit */}
          <button className="toggle-details-button" onClick={() => {
            setShowDetails(!showDetails);
            console.log("Toggle détails produit :", !showDetails);
          }}>
            {showDetails ? "Masquer les détails" : "Détails du produit"}
          </button>

          {/* Description détaillée du produit */}
          {showDetails && <p className="product-detail-description">{product.description}</p>}

          {/* Messages utilisateur */}
          {message && <div className="success-message">{message}</div>}
          {likeMessage && <div className="like-message">{likeMessage}</div>}

        </div>
      </div>

      {/* Suggestions */}
      <div className="suggestions-section">
        <h2>VOUS ALLEZ ADORER ÇA !</h2>
        <div className="suggestions-carousel">
          <PreviousButton onClick={handlePrev} />
          <div className="suggestions-list">
            {visibleSuggestions.map(s => (
              <div key={s.id} className="suggestion-card" onClick={() => handleSuggestionClick(s.id)} style={{ cursor: 'pointer' }}>
                <img src={`http://127.0.0.1:8001${s.image}`} alt={s.name} className="suggestion-image" />
                <p>{s.name}</p>
                <p>{Number(s.price).toFixed(2)} €</p>
              </div>
            ))}
          </div>
          <NextButton onClick={handleNext} />
        </div>
      </div>

    </div>
  );
};

export default ProductDetail;
