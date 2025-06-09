import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddButton2 from "./AddButton2.jsx";
import PreviousButton from "./PreviousButton.jsx";
import NextButton from "./NextButton.jsx";
import LikeButton from "./LikeButton.jsx";

const api = axios.create({
  baseURL: "http://127.0.0.1:8001/",
});

const generateRandomAlphanumeric = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
};

const getFavoritesFromStorage = () => {
  const stored = localStorage.getItem('favorites');
  return stored ? JSON.parse(stored) : {};
};

const saveFavoritesToStorage = (favorites) => {
  localStorage.setItem('favorites', JSON.stringify(favorites));
};

const ProductDetail = () => {
  const { id, category } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [visibleSuggestions, setVisibleSuggestions] = useState([]);
  const [inCart, setInCart] = useState({});
  const [message, setMessage] = useState('');
  const [likeMessage, setLikeMessage] = useState('');
  const [favorites, setFavorites] = useState(getFavoritesFromStorage());
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');
  const [outOfStock, setOutOfStock] = useState(false);

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

  useEffect(() => {
    if (!id) {
      console.warn("Aucun ID produit reçu dans l'URL");
      return;
    }

    console.log(`Chargement du produit id=${id}`);
    api.get(`product/${id}/`)
      .then((res) => {
        console.log("Produit chargé :", res.data);
        setProduct(res.data);
        if (Array.isArray(res.data.sizes) && res.data.sizes.length > 0) {
          setSize(res.data.sizes[0]);
        } else {
          setSize('');
        }
        setQuantity(1);
        setMessage('');
        setAdded(false);
        setError('');
        setOutOfStock(res.data.stock === 0);  // <-- ici on set outOfStock selon le stock
      })
      .catch((err) => {
        setProduct(null);
        console.error("Erreur récupération produit :", err);
      });
  }, [id]);

  useEffect(() => {
    if (!id) {
      setSuggestions([]);
      setVisibleSuggestions([]);
      return;
    }

    console.log(`Chargement des suggestions pour produit id=${id}`);
    api.get(`products/${id}/suggestions/`)
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setSuggestions(res.data);
          setVisibleSuggestions(res.data.slice(0, 4));
          console.log("Suggestions chargées :", res.data);
        } else {
          setSuggestions([]);
          setVisibleSuggestions([]);
          console.log("Pas de suggestions trouvées");
        }
      })
      .catch(err => {
        console.error("Erreur chargement suggestions spécifiques produit :", err);
        setSuggestions([]);
        setVisibleSuggestions([]);
      });
  }, [id]);

  const addToCart = () => {
    setError('');
    setMessage('');
    setOutOfStock(false);
  
    if (!product) {
      setError("Aucun produit sélectionné.");
      return;
    }
  
    if (Array.isArray(product.sizes) && product.sizes.length > 0 && !size) {
      setError("Veuillez sélectionner une taille.");
      return;
    }
  
    if (quantity > product.stock) {
      setOutOfStock(true);
      setError(`Stock insuffisant : ${product.stock} disponible.`);
      return;
    }
  
    const payload = {
      cart_code: cartCode,
      item_id: Number(product.id),
      quantity: Number(quantity),
      size: size || "default",
    };
  
    console.log("Payload envoyé à add_item:", payload);
  
    api.post("add_item", payload)
    .then(() => {
      setMessage("Produit ajouté au panier !");
      setAdded(true);
      setInCart(prev => ({ ...prev, [product.id]: true }));
  
      return api.get(`product/${product.id}/`);
    })
    .then((res) => {
      console.log("Produit rechargé après ajout au panier :", res.data);
      setProduct(res.data);
  
      if (res.data.stock === 0) {
        setOutOfStock(true);
        setError("Stock épuisé !");
      }
    })
    .catch(err => {
      setError("Erreur lors de l'ajout au panier ou rechargement du produit.");
      console.error(err);
    });
  };
  

  const toggleFavorite = (productId) => {
    const updated = { ...favorites, [productId]: !favorites[productId] };
    setFavorites(updated);
    saveFavoritesToStorage(updated);
    setLikeMessage(updated[productId] ? "Produit liké !" : "Produit retiré des favoris.");
    setTimeout(() => setLikeMessage(''), 1000);
    console.log(`Favori changé pour produit ${productId} : ${updated[productId]}`);
  };

  const handleNext = () => {
    setVisibleSuggestions(prev => {
      if (prev.length === 0) return [];
      return [...prev.slice(1), prev[0]];
    });
  };

  const handlePrev = () => {
    setVisibleSuggestions(prev => {
      if (prev.length === 0) return [];
      return [prev[prev.length - 1], ...prev.slice(0, -1)];
    });
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/produit/${productId}/${category}`);
  };

  if (!product) return <div>Chargement du produit...</div>;

  const priceFormatted = Number(product.price).toFixed(2);

  console.log(`Render ProductDetail - stock: ${product.stock}, outOfStock: ${outOfStock}, added: ${added}`);

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

          {/* Bouton qui change si outOfStock */}
          <AddButton2
            onClick={addToCart}
            disabled={outOfStock}
            outOfStock={outOfStock}
          >
            {outOfStock ? "Article épuisé" : "Ajouter au panier"}
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
  {outOfStock && (
        <div className="stock-message">Produit en rupture de stock</div>
      )}
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
