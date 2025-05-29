import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [inCart, setInCart] = useState({});
  const [favorites, setFavorites] = useState(getFavoritesFromStorage());

  // Message spécifique pour like/unlike
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

    api.get(`products/${backendCategory}/`)
      .then(res => {
        setProducts(res.data);

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
      .catch(() => {
        setProducts([]);
      });
  }, [category, cartCode]);

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

    // Log console pour trace
    if (updatedFavorites[productId]) {
      console.log(`Produit ${productId} liké 👍`);
      setLikeMessage(`Vous avez aimé le produit ${productId} !`);
    } else {
      console.log(`Produit ${productId} unliké 👎`);
      setLikeMessage(`Vous avez retiré le like du produit ${productId}.`);
    }

    // Effacer le message après 2 secondes
    setTimeout(() => {
      setLikeMessage('');
    }, 2000);
  };

  return (
    <div className="container-product">
      <h2 className="title">{category ? category.toUpperCase() : "Produits"}</h2>
  
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
