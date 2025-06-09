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
      console.log("Generated new cart code:", code);
    } else {
      console.log("Loaded cart code from localStorage:", code);
    }
    return code;
  });

  // Récupération du produit
  useEffect(() => {
    if (!id) return;

    console.log("Fetching product with id:", id);
    api.get(`product/${id}/`).then((res) => {
      console.log("Product data received:", res.data);
      setProduct(res.data);
      const availableSizes = res.data.available_sizes || [];

      if (availableSizes.length > 0) {
        setSize(availableSizes[0]);
        setOutOfStock(false);
      } else {
        setSize('');
        setOutOfStock(true);
      }

      setQuantity(1);
      setMessage('');
      setAdded(false);
      setError('');
    }).catch((err) => {
      setProduct(null);
      console.error("Erreur récupération produit :", err);
      setError("Erreur lors de la récupération du produit.");
    });
  }, [id]);

  // Récupération des suggestions
  useEffect(() => {
    if (!id) return;

    console.log("Fetching suggestions for product id:", id);
    api.get(`products/${id}/suggestions/`).then(res => {
      console.log("Suggestions data:", res.data);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setSuggestions(res.data);
        setVisibleSuggestions(res.data.slice(0, 4));
      } else {
        setSuggestions([]);
        setVisibleSuggestions([]);
      }
    }).catch((err) => {
      console.error("Erreur récupération suggestions :", err);
      setSuggestions([]);
      setVisibleSuggestions([]);
    });
  }, [id]);

  const addToCart = () => {
    setError('');
    setMessage('');
    setOutOfStock(false);

    if (!product) return setError("Aucun produit sélectionné.");
    if (!size) return setError("Veuillez sélectionner une taille.");
    if (quantity > product.stock) {
      setOutOfStock(true);
      return setError(`Stock insuffisant : ${product.stock} disponible.`);
    }

    const payload = {
      cart_code: cartCode,
      item_id: Number(product.id),
      quantity: Number(quantity),
      size: size,
    };

    console.log("Adding to cart with payload:", payload);

    api.post("add_item", payload).then(() => {
      console.log("Produit ajouté au panier avec succès");
      setMessage("Produit ajouté au panier !");
      setAdded(true);
      setInCart(prev => ({ ...prev, [product.id]: true }));

      return api.get(`product/${product.id}/`);
    }).then((res) => {
      console.log("Produit rechargé après ajout au panier :", res.data);
      setProduct(res.data);
      if ((res.data.available_sizes || []).length === 0) {
        setOutOfStock(true);
        setError("Stock épuisé !");
      }
    }).catch(err => {
      console.error("Erreur lors de l'ajout au panier ou rechargement :", err);
      setError("Erreur lors de l'ajout au panier ou rechargement du produit.");
    });
  };

  const toggleFavorite = (productId) => {
    const updated = { ...favorites, [productId]: !favorites[productId] };
    setFavorites(updated);
    saveFavoritesToStorage(updated);
    setLikeMessage(updated[productId] ? "Produit liké !" : "Produit retiré des favoris.");
    setTimeout(() => setLikeMessage(''), 1000);
    console.log(`Favori pour produit ${productId} mis à jour:`, updated[productId]);
  };

  const handleNext = () => {
    setVisibleSuggestions(prev => {
      const next = [...prev.slice(1), prev[0]];
      console.log("Suggestions après Next:", next);
      return next;
    });
  };

  const handlePrev = () => {
    setVisibleSuggestions(prev => {
      const prevArr = [prev[prev.length - 1], ...prev.slice(0, -1)];
      console.log("Suggestions après Prev:", prevArr);
      return prevArr;
    });
  };

  const handleSuggestionClick = (productId) => {
    console.log("Suggestion cliquée, navigation vers produit id:", productId);
    navigate(`/produit/${productId}/${category}`);
  };

  if (!product) return <div>Chargement du produit...</div>;

  const priceFormatted = Number(product.price).toFixed(2);
  const availableSizes = product.available_sizes || [];

  return (
    <div className="product-detail-container">
      <div className="product-detail-content">
        <div className="product-image">
          <img
            src={`http://127.0.0.1:8001${product.image}`}
            alt={product.name}
            onError={(e) => { e.target.src = "/default-image.jpg"; }}
          />
        </div>

        <div className="product-detail-info">
          <h2>{product.name}</h2>
          <p>Prix : {priceFormatted} €</p>
          <p>Catégorie : {product.category}</p>

          <div className="product-detail-size-selector">
            <p>Taille :</p>
            {Array.isArray(product.sizes) && product.sizes.length > 0 ? (
              product.sizes.map((s, index) => {
                const isAvailable = availableSizes.includes(s);
                return (
                  <button
                    key={index}
                    className={`size-button ${size === s ? 'selected' : ''}`}
                    onClick={() => {
                      if (isAvailable) {
                        setSize(s);
                        console.log("Taille sélectionnée:", s);
                      }
                    }}
                    disabled={!isAvailable}
                    style={{
                      opacity: isAvailable ? 1 : 0.4,
                      cursor: isAvailable ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {s}
                  </button>
                );
              })
            ) : (
              <p>Aucune taille disponible</p>
            )}
          </div>

          <div className="product-detail-quantity-selector">
            <p>Quantité :</p>
            <div className="quantity-controls">
              <button onClick={() => {
                setQuantity(Math.max(1, quantity - 1));
                console.log("Quantité diminuée:", Math.max(1, quantity - 1));
              }}>-</button>
              <input
                type="number"
                value={quantity}
                min="1"
                max="99"
                onChange={(e) => {
                  const val = Math.max(1, Math.min(99, parseInt(e.target.value) || 1));
                  setQuantity(val);
                  console.log("Quantité modifiée:", val);
                }}
              />
              <button onClick={() => {
                setQuantity(Math.min(99, quantity + 1));
                console.log("Quantité augmentée:", Math.min(99, quantity + 1));
              }}>+</button>
            </div>
          </div>

          <AddButton2
            onClick={addToCart}
            disabled={outOfStock}
            outOfStock={outOfStock}
          >
            {outOfStock ? "Article épuisé" : "Ajouter au panier"}
          </AddButton2>

          <div className="Like-button">
            <LikeButton
              productId={product.id}
              isLiked={favorites[product.id] || false}
              toggleFavorite={toggleFavorite}
            />
          </div>

          {outOfStock && <div className="stock-message">Produit en rupture de stock</div>}

          <button className="toggle-details-button" onClick={() => {
            setShowDetails(!showDetails);
            console.log("Détails du produit affichés:", !showDetails);
          }}>
            {showDetails ? "Masquer les détails" : "Détails du produit"}
          </button>

          {showDetails && <p className="product-detail-description">{product.description}</p>}

          {message && <div className="success-message">{message}</div>}
          {likeMessage && <div className="like-message">{likeMessage}</div>}
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>

      <div className="suggestions-section">
        <h2>VOUS ALLEZ ADORER ÇA !</h2>
        <div className="suggestions-navigation">
          <PreviousButton onClick={handlePrev} />
          <NextButton onClick={handleNext} />
        </div>
        <div className="suggestions-list">
          {visibleSuggestions.map((prod) => (
            <div
              key={prod.id}
              className="suggestion-card"
              onClick={() => handleSuggestionClick(prod.id)}
            >
              <img
                src={`http://127.0.0.1:8001${prod.image}`}
                alt={prod.name}
                onError={(e) => { e.target.src = "/default-image.jpg"; }}
              />
              <p>{prod.name}</p>
              <p>{Number(prod.price).toFixed(2)} €</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
