import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddButton2 from "./AddButton2.jsx";

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
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [inCart, setInCart] = useState({});
  const [message, setMessage] = useState('');
  const [likeMessage, setLikeMessage] = useState('');
  const [favorites, setFavorites] = useState(getFavoritesFromStorage());
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const [suggestedProducts, setSuggestedProducts] = useState([]);

  const [cartCode] = useState(() => {
    let code = localStorage.getItem("cart_code");
    if (!code) {
      code = generateRandomAlphanumeric();
      localStorage.setItem("cart_code", code);
    }
    console.log("Cart code utilisé :", code);
    return code;
  });

  // Chargement du produit principal
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

  // Chargement des produits suggérés
  useEffect(() => {
    if (!category) return;

    const cat = categoryMap[category];
    console.log("Catégorie pour produits suggérés :", cat);

    api.get(`products?category=${cat}`)
      .then((res) => {
        console.log("Produits suggérés reçus :", res.data);
        const filtered = res.data.filter(p => p.id !== Number(id));
        console.log("Produits suggérés après filtrage :", filtered);
        setSuggestedProducts(filtered);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des produits suggérés :", err);
      });
  }, [category, id]);

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

  const toggleFavorite = (productId) => {
    const updated = { ...favorites, [productId]: !favorites[productId] };
    setFavorites(updated);
    saveFavoritesToStorage(updated);
    setLikeMessage(updated[productId] ? "Produit liké !" : "Produit retiré des favoris.");
    console.log("Favoris mis à jour :", updated);
    setTimeout(() => setLikeMessage(''), 2000);
  };

  if (!product) return <div>Chargement...</div>;

  const priceFormatted = Number(product.price).toFixed(2);

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

      <div className="suggested-products-section" style={{ marginTop: '2rem' }}>
        <h3>Produits suggérés</h3>
        {suggestedProducts.length === 0 ? (
          <p>Aucun produit suggéré disponible.</p>
        ) : (
          <div className="suggested-products-list" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {suggestedProducts.map((p) => (
              <div
                key={p.id}
                className="suggested-product-card"
                style={{ border: '1px solid #ccc', padding: '1rem', width: '150px', cursor: 'pointer' }}
                onClick={() => {
                  console.log("Produit suggéré cliqué :", p.id);
                  navigate(`/product/${p.id}/${category}`);
                }}
              >
                <img
                  src={`http://127.0.0.1:8001${p.image}`}
                  alt={p.name}
                  style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = "/default-image.jpg"; }}
                />
                <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>{p.name}</p>
                <p>{Number(p.price).toFixed(2)} €</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
