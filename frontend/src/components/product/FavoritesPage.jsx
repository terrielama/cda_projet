import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: "http://127.0.0.1:8001/",
});

const FavoritesPage = () => {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    const favorites = stored ? JSON.parse(stored) : {};

    const likedProductIds = Object.keys(favorites).filter(id => favorites[id]);

    if (likedProductIds.length === 0) {
      setFavoriteProducts([]);
      return;
    }

    Promise.all(
      likedProductIds.map(id =>
        api.get(`products/detail/${id}/`).then(res => res.data).catch(() => null)
      )
    ).then(products => {
      const validProducts = products.filter(p => p !== null);
      setFavoriteProducts(validProducts);
    });
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/produit/${productId}`);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">❤️ Produits Favoris</h2>

      {favoriteProducts.length === 0 ? (
        <p className="text-center">Aucun produit en favori pour le moment.</p>
      ) : (
        <div className="row row-card">
          {favoriteProducts.map(product => (
            <div key={product.id} className="col-md-4 mb-4">
              <div className="card shadow-sm">
                <img
                  src={product.image}
                  alt={product.name}
                  className="card-img-top"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleProductClick(product.id)}
                />
                <div className="card-body text-center">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text text-primary fw-bold">{parseFloat(product.price).toFixed(2)}€</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
