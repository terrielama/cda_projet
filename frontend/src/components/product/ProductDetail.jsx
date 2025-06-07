import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate pour navigation client-side
import axios from 'axios';
import AddButton2 from "./AddButton2.jsx";
import PreviousButton from "./PreviousButton.jsx";
import NextButton from "./NextButton.jsx";

const api = axios.create({
  baseURL: "http://127.0.0.1:8001/",
});

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

function generateRandomAlphanumeric(length = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
}

const getFavoritesFromStorage = () => {
  const stored = localStorage.getItem('favorites');
  return stored ? JSON.parse(stored) : {};
};

const saveFavoritesToStorage = (favorites) => {
  localStorage.setItem('favorites', JSON.stringify(favorites));
};

const ProductDetail = () => {
  const { id, category } = useParams();
  const navigate = useNavigate(); // Hook React Router pour la navigation
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [inCart, setInCart] = useState({});
  const [message, setMessage] = useState('');
  const [likeMessage, setLikeMessage] = useState('');
  const [favorites, setFavorites] = useState(getFavoritesFromStorage());
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [visibleSuggestions, setVisibleSuggestions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [cartCode] = useState(() => {
    let code = localStorage.getItem("cart_code");
    if (!code) {
      code = generateRandomAlphanumeric();
      localStorage.setItem("cart_code", code);
    }
    console.log("Cart code utilisé :", code);
    return code;
  });

  // Chargement du produit en fonction de l'ID
  useEffect(() => {
    if (!id) return;

    console.log("Chargement du produit avec ID :", id);

    api.get(`product/${id}/`)
      .then((res) => {
        setProduct(res.data);
        console.log("Produit récupéré :", res.data);
        if (Array.isArray(res.data.sizes) && res.data.sizes.length > 0) {
          setSize(res.data.sizes[0]);
          console.log("Taille sélectionnée par défaut :", res.data.sizes[0]);
        } else {
          setSize('');
          console.log("Aucune taille disponible pour ce produit");
        }
      })
      .catch((err) => {
        setProduct(null);
        console.error("Erreur lors de la récupération du produit :", err);
      });
  }, [id]);

  // Chargement des produits suggérés par catégorie
  useEffect(() => {
    console.log("Category dans useEffect suggestions :", category);
    if (!category) {
      console.warn("La catégorie est vide ou non définie");
      setProducts([]);
      setVisibleSuggestions([]);
      return;
    }
  
    const backendCategory = categoryMap[category.toLowerCase()];
    console.log("Catégorie front:", category, "→ backend:", backendCategory);
  
    if (!backendCategory) {
      console.warn("Catégorie backend non trouvée pour :", category);
      setProducts([]);
      setVisibleSuggestions([]);
      return;
    }
  
    api.get(`products/${backendCategory}/`)
      .then(res => {
        console.log("Réponse API produits suggérés :", res.data);
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProducts(res.data);
          setVisibleSuggestions(res.data.slice(0, 4));
          console.log("Suggestions visibles :", res.data.slice(0, 4));
        } else {
          console.warn("La liste des produits suggérés est vide !");
          setProducts([]);
          setVisibleSuggestions([]);
        }
      })
      .catch(err => {
        console.error("Erreur lors du chargement des produits suggérés :", err);
        setProducts([]);
        setVisibleSuggestions([]);
      });
  }, [category, cartCode]);
  
  
  // Ajout au panier
  const addToCart = () => {
    if (!product) return;

    console.log("Ajout au panier :", {
      cart_code: cartCode,
      item_id: product.id,
      quantity,
      size
    });

    if (Array.isArray(product.sizes) && product.sizes.length > 0 && !size) {
      setMessage("Veuillez sélectionner une taille.");
      console.warn("Ajout au panier annulé : taille non sélectionnée");
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
        console.log("Produit ajouté avec succès !");
      })
      .catch(err => {
        setMessage("Erreur lors de l'ajout au panier.");
        console.error("Erreur ajout panier :", err);
      });
  };

  // Gestion des favoris
  const toggleFavorite = (productId) => {
    const updated = { ...favorites, [productId]: !favorites[productId] };
    setFavorites(updated);
    saveFavoritesToStorage(updated);
    setLikeMessage(updated[productId] ? "Produit liké !" : "Produit retiré des favoris.");
    console.log("Favoris mis à jour :", updated);
    setTimeout(() => setLikeMessage(''), 2000);
  };

  // Gestion suggestions suivante/précédente
  const handleNext = () => {
    setVisibleSuggestions(prev => [...prev.slice(1), prev[0]]);
    console.log("Suggestion suivante");
  };

  const handlePrev = () => {
    setVisibleSuggestions(prev => [prev[prev.length - 1], ...prev.slice(0, -1)]);
    console.log("Suggestion précédente");
  };

  // Navigation client-side vers la page produit depuis une suggestion
  const handleSuggestionClick = (productId) => {
    console.log("Suggestion cliquée, navigation vers produit :", productId);
    navigate(`/produit/${productId}`);
  };

  if (!product) return <div>Chargement...</div>;

  const priceFormatted = Number(product.price).toFixed(2);

  console.log("visibleSuggestions:", visibleSuggestions);

  return (
    <div className="product-detail-container">
      <div className="product-detail-content">
        <div className="product-image">
          <img
            src={`http://127.0.0.1:8001${product.image}`}
            alt={product.name}
            className="img-fluid"
            onError={(e) => { e.target.src = "/default-image.jpg"; }}
          />
        </div>

        <div className="product-detail-info">
          <h2 className="product-detail-title">{product.name}</h2>

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

          <div className="product-detail-quantity-selector">
            <p>Quantité :</p>
            <div className="quantity-controls">
              <button onClick={() => {
                const newQty = Math.max(1, quantity - 1);
                setQuantity(newQty);
                console.log("Quantité réduite à :", newQty);
              }}>-</button>
              <input
                type="number"
                value={quantity}
                min="1"
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(val);
                  console.log("Quantité saisie :", val);
                }}
              />
              <button onClick={() => {
                const newQty = quantity + 1;
                setQuantity(newQty);
                console.log("Quantité augmentée à :", newQty);
              }}>+</button>

              <AddButton2 className="add-to-cart-button" onClick={addToCart}>
                {inCart[product.id] ? "Déjà dans le panier" : "Ajouter au panier"}
              </AddButton2>
            </div>
          </div>

          <button className="toggle-details-button" onClick={() => {
            setShowDetails(!showDetails);
            console.log("Toggle détails produit :", !showDetails);
          }}>
            {showDetails ? "Masquer les détails" : "Détails du produit"}
          </button>

          {showDetails && <p className="product-detail-description">{product.description}</p>}

          {message && <div className="success-message">{message}</div>}
          {likeMessage && <div className="like-message">{likeMessage}</div>}
        </div>
      </div>

      {/* Section produits suggérés */}
      <div className="suggested-products-section">
        <h3>VOUS ALLEZ ADORER ÇA</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Bouton précédent */}
          <PreviousButton onClick={handlePrev} />
          {/* Liste des suggestions visibles */}
          <div
            className="suggested-products-list"
            style={{ display: 'flex', overflow: 'hidden', gap: '10px', flexGrow: 1 }}
          >
            {visibleSuggestions.map((item) => (
              <div
                key={item.id}
                className="suggested-product-card"
                style={{
                  flex: '0 0 calc(25% - 10px)', // 4 produits par ligne
                  border: '1px solid #ccc',
                  padding: '10px',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  console.log("Suggestion cliquée :", item);
                  // Ici tu peux rediriger vers ce produit, par ex via react-router :
                  window.location.href = `/produit/${item.id}`;
                  
                }}
              >
                <img src={item.image} alt={item.name} style={{ width: '100%', height: 'auto' }} />
                <p style={{ margin: '5px 0' }}>{item.name}</p>
                <p style={{ fontWeight: 'bold' }}>{item.price.toFixed(2)}€</p>
              </div>
            ))}
          </div>

          {/* Bouton suivant */}
          <NextButton onClick={handleNext} ></NextButton>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;