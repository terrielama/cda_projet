import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LikeButton from './LikeButton.jsx';

// Instance axios avec baseURL
const api = axios.create({
  baseURL: "http://127.0.0.1:8001/",
});

// Correspondance catégories URL → backend
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

// Génération d'un code alphanumérique aléatoire (pour cart_code)
function generateRandomAlphanumeric(length = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');
}

// Lecture / écriture des favoris dans localStorage
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

  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [inCart, setInCart] = useState({});
  const [favorites, setFavorites] = useState(getFavoritesFromStorage());
  const [likeMessage, setLikeMessage] = useState('');

  // 🛒 Cart code unique en localStorage
  const [cartCode] = useState(() => {
    let code = localStorage.getItem("cart_code");
    if (!code) {
      code = generateRandomAlphanumeric();
      localStorage.setItem("cart_code", code);
      console.log("🔐 Nouveau cart_code généré :", code);
    } else {
      console.log("✅ cart_code existant :", code);
    }
    return code;
  });

  // 🔁 Récupère les quantités pour la liste des produits, appelé uniquement quand produits changent
  const fetchCartQuantities = async (productsList) => {
    const updated = {};
    await Promise.all(
      productsList.map(async (product) => {
        try {
          const response = await api.get(`product_in_cart?cart_code=${cartCode}&product_id=${product.id}`);
          updated[product.id] = response.data.quantity || 0;
        } catch (error) {
          console.warn(`Erreur récupération quantité produit ${product.id} :`, error);
          updated[product.id] = 0; // fallback
        }
      })
    );
    setInCart(updated);
  };

  // 🧲 Récupération produits à l’affichage au chargement / changement catégorie ou recherche
  useEffect(() => {
    if (!category) return;

    const backendCategory = categoryMap[category.toLowerCase()];
    if (!backendCategory) {
      console.warn("Catégorie inconnue :", category);
      setProducts([]);
      return;
    }

    api.get(`products/${backendCategory}/`, { params: { search: query } })
      .then(res => {
        setProducts(res.data);
        fetchCartQuantities(res.data);  // Mise à jour quantités panier
      })
      .catch(err => {
        console.error("Erreur récupération produits :", err);
        setProducts([]);
      });
  }, [category, query, cartCode]);



  const handleProductClick = (productId) => {
    navigate(`/produit/${productId}`);
  };

  // Gestion favoris localStorage
  const toggleFavorite = (productId) => {
    const updatedFavorites = {
      ...favorites,
      [productId]: !favorites[productId],
    };
    setFavorites(updatedFavorites);
    saveFavoritesToStorage(updatedFavorites);

    setLikeMessage(updatedFavorites[productId]
      ? `Vous avez aimé le produit ${productId} !`
      : `Vous avez retiré le like du produit ${productId}.`);

    setTimeout(() => setLikeMessage(''), 2000);
  };

  return (
    <div className="container-product">
      {message && <div className="alert success">{message}</div>}
      {likeMessage && <div className="alert info">{likeMessage}</div>}

      <div className="row-card">
        {products.length === 0 && <p className="no-product">Aucun produit trouvé pour cette catégorie.</p>}

        {products.map(product => {
          const price = Number(product.price);
          const formattedPrice = isNaN(price) ? "N/A" : price.toFixed(2);

          const quantityInCart = inCart[product.id] || 0;
          const isOutOfStock = quantityInCart >= Number(product.stock);

          return (
            <div key={product.id} className="card-wrapper">
              <div className="card shadow-sm">
                <img
                  src={product.image}
                  alt={product.name}
                  className="card-img-top"
                  onClick={() => handleProductClick(product.id)}
                  style={{ cursor: 'pointer' }}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-price">{formattedPrice}€</p>

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
