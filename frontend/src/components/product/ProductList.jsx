import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AddButton from "./AddButton.jsx";
import LikeButton from './LikeButton.jsx';

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
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const getFavoritesFromStorage = () => {
  const stored = localStorage.getItem('favorites');
  return stored ? JSON.parse(stored) : {};
};

const saveFavoritesToStorage = (favorites) => {
  localStorage.setItem('favorites', JSON.stringify(favorites));
};

const ProductList = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [inCart, setInCart] = useState({});
  const [favorites, setFavorites] = useState(getFavoritesFromStorage());
  const [likeMessage, setLikeMessage] = useState('');

  const [cartCode] = useState(() => {
    let code = localStorage.getItem("cart_code");
    if (!code) {
      code = generateRandomAlphanumeric();
      localStorage.setItem("cart_code", code);
    }
    return code;
  });

  useEffect(() => {
    if (!category) return;

    const backendCategory = categoryMap[category.toLowerCase()];
    if (!backendCategory) {
      setProducts([]);
      return;
    }

    console.log("Chargement produits pour catégorie :", backendCategory);
    console.log("Recherche active :", query);

    api.get(`products/${backendCategory}/`, {
      params: { search: query }
    })
      .then(res => {
        setProducts(res.data);
        console.log("Produits récupérés :", res.data);

        res.data.forEach(product => {
          api.get(`product_in_cart?cart_code=${cartCode}&product_id=${product.id}`)
            .then(response => {
              if (response.data.product_in_cart) {
                setInCart(prev => ({ ...prev, [product.id]: true }));
              }
            })
            .catch(() => {});
        });
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des produits :", err);
        setProducts([]);
      });
  }, [category, cartCode, query]);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      api.get(`/search_products/`, { params: { search: query } })
        .then((res) => {
          setSuggestions(res.data);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const add_item = (product_id) => {
    api.post("add_item", {
      cart_code: cartCode,
      item_id: product_id,
      quantity: 1,
      size: "8.25",
    })
      .then(() => {
        setMessage("Produit ajouté au panier !");
        setInCart(prev => ({ ...prev, [product_id]: true }));
      })
      .catch(() => {
        setMessage("Erreur lors de l'ajout au panier.");
      });
  };

  const handleProductClick = (productId) => {
    navigate(`/produit/${productId}`);
  };

  const toggleFavorite = (productId) => {
    const updatedFavorites = {
      ...favorites,
      [productId]: !favorites[productId]
    };
    setFavorites(updatedFavorites);
    saveFavoritesToStorage(updatedFavorites);

    if (updatedFavorites[productId]) {
      console.log(`Produit ${productId} liké 👍`);
      setLikeMessage(`Vous avez aimé le produit ${productId} !`);
    } else {
      console.log(`Produit ${productId} unliké 👎`);
      setLikeMessage(`Vous avez retiré le like du produit ${productId}.`);
    }

    setTimeout(() => {
      setLikeMessage('');
    }, 2000);
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/produit/${productId}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    api.get(`/search_products/`, { params: { search: query } })
      .then((res) => {
        setProducts(res.data);
        setSuggestions([]);
      });
  };

  return (
    <div className="container-product">
      <h2 className="title">{category ? category.toUpperCase() : "Tous les produits"}</h2>

      <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "300px", padding: "0.5rem" }}
        />

        {suggestions.length > 0 && (
          <ul style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '300px',
            background: 'white',
            border: '1px solid #ccc',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 999
          }}>
            {suggestions.map((product) => (
              <li
                key={product.id}
                onClick={() => handleSuggestionClick(product.id)}
                style={{
                  padding: '0.5rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee'
                }}
              >
                {product.name}
              </li>
            ))}
          </ul>
        )}
      </form>

      {message && <div className="alert success">{message}</div>}
      {likeMessage && <div className="alert info">{likeMessage}</div>}

      <div className="row-card">
        {products.length === 0 && <p className="no-product">Aucun produit trouvé pour cette catégorie.</p>}

        {products.map(product => {
          const priceNumber = Number(product.price);
          const priceFormatted = isNaN(priceNumber) ? "N/A" : priceNumber.toFixed(2);

          return (
            <div key={product.id} className="card-wrapper">
              <div className="card shadow-sm">
                <img
                  src={product.image}
                  alt={product.name}
                  className="card-img-top"
                  onClick={() => handleProductClick(product.id)}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-price">{priceFormatted}€</p>

                  <AddButton
                    onClick={() => add_item(product.id)}
                    disabled={inCart[product.id]}
                  >
                    {inCart[product.id] ? 'Déjà dans le panier' : 'Ajouter au panier'}
                  </AddButton>

                  <LikeButton
                    productId={product.id}
                    isLiked={favorites[product.id] || false}
                    toggleFavorite={toggleFavorite}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;
