import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: "http://127.0.0.1:8001/",
});

// Génère un code alphanumérique aléatoire pour identifier le panier
function generateRandomAlphanumeric(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for(let i=0; i<length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const FavoritesPage = () => {
  // Initialisation du cartCode depuis localStorage ou génération d'un nouveau
  const [cartCode] = useState(() => {
    let code = localStorage.getItem("cart_code");
    if (!code) {
      code = generateRandomAlphanumeric();
      localStorage.setItem("cart_code", code);
      console.log("Nouveau cartCode généré:", code);
    } else {
      console.log("cartCode récupéré depuis localStorage:", code);
    }
    return code;
  });

  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const navigate = useNavigate();

  // Chargement des produits favoris au montage du composant
  useEffect(() => {
    console.log("Chargement des favoris depuis localStorage");
    const stored = localStorage.getItem('favorites');
    const favorites = stored ? JSON.parse(stored) : {};

    const likedProductIds = Object.keys(favorites).filter(id => favorites[id]);
    console.log("Produits favoris IDs :", likedProductIds);

    if (likedProductIds.length === 0) {
      setFavoriteProducts([]);
      console.log("Aucun produit favori trouvé.");
      return;
    }

    // On récupère les détails des produits favoris en parallèle
    Promise.all(
      likedProductIds.map(id =>
        api.get(`products/detail/${id}/`)
          .then(res => {
            console.log(`Produit ${id} chargé`, res.data);
            return res.data;
          })
          .catch(err => {
            console.error(`Erreur chargement produit ${id}:`, err);
            return null;
          })
      )
    ).then(products => {
      const validProducts = products.filter(p => p !== null);

      // On complète les URL d'image si besoin
      const productsWithFullImage = validProducts.map(p => ({
        ...p,
        image: p.image.startsWith('http') ? p.image : `http://127.0.0.1:8001${p.image}`,
      }));

      setFavoriteProducts(productsWithFullImage);
      console.log("Produits favoris chargés avec images:", productsWithFullImage);
    });
  }, []);

  // Mise à jour de la taille sélectionnée pour un produit
  const handleSizeChange = (productId, size) => {
    console.log(`Taille sélectionnée pour produit ${productId}: ${size}`);
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  // Ajout d'un produit au panier
  const handleAddToCart = async (product) => {
    const size = selectedSizes[product.id];
    console.log(`Tentative d'ajout au panier produit ${product.id} avec taille ${size}`);

    // Vérification que la taille est sélectionnée si nécessaire
    if (product.sizes && product.sizes.length > 0 && !size) {
      alert("Veuillez choisir une taille avant d'ajouter au panier.");
      console.warn("Ajout au panier bloqué : taille non sélectionnée");
      return;
    }
    try {
      const payload = {
        cart_code: cartCode,
        item_id: product.id,
        quantity: 1,
        size: size || null,
      };
      console.log("Envoi POST add_item avec payload :", payload);

      await api.post("add_item", payload);

      // Suppression du produit des favoris après ajout au panier
      setFavoriteProducts(prev => {
        const updated = prev.filter(p => p.id !== product.id);
        console.log(`Mise à jour favoriteProducts, suppression produit ${product.id}`, updated);
        return updated;
      });

      // Met à jour aussi le localStorage pour retirer le produit des favoris
      const stored = localStorage.getItem('favorites');
      const favorites = stored ? JSON.parse(stored) : {};
      if (favorites[product.id]) {
        delete favorites[product.id];
        localStorage.setItem('favorites', JSON.stringify(favorites));
        console.log(`Produit ${product.id} supprimé des favoris dans localStorage`);
      }

      alert("Produit ajouté au panier !");
      console.log(`Produit ${product.id} ajouté au panier et supprimé des favoris.`);
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier :", error);
      alert("Erreur lors de l'ajout au panier, veuillez réessayer.");
    }
  };

  // Navigation vers la page détail produit au clic sur l'image
  const handleProductClick = (productId) => {
    console.log(`Navigation vers produit ${productId}`);
    navigate(`/produit/${productId}`);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">❤️ Produits Favoris</h2>

      {favoriteProducts.length === 0 ? (
        <p className="text-center">Aucun produit en favori pour le moment.</p>
      ) : (
        <div className="row row-card">
          {favoriteProducts.map(product => {
            // Définition de la liste des tailles selon la catégorie du produit
            let sizesList = [];
            const cat = product.category?.toLowerCase() || '';

            if (cat === 'boards') {
              sizesList = ["7.5", "7.75", "8.0", "8.25", "8.5"];
            } else if (cat === 'chaussures') {
              sizesList = ["38", "39", "40", "41", "42", "43", "44"];
            } else if (cat === 'sweats') {
              sizesList = ["XS", "S", "M", "L", "XL"];
            } else {
              sizesList = product.sizes || [];
            }

            return (
              <div key={product.id} className="col-md-4 mb-4">
                <div className="card shadow-sm">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="card-img-top"
                    style={{ cursor: 'pointer', objectFit: 'cover', height: '200px' }}
                    onClick={() => handleProductClick(product.id)}
                    onError={e => e.currentTarget.src = '/placeholder.png'}
                  />
                  <div className="card-body text-center">
                    <h5 className="card-title text-uppercase">{product.category}</h5>
                    <p className="card-text text-primary fw-bold">{parseFloat(product.price).toFixed(2)}€</p>

                    {sizesList.length > 0 ? (
                      <select
                        value={selectedSizes[product.id] || ''}
                        onChange={e => handleSizeChange(product.id, e.target.value)}
                        className="form-select mb-2"
                      >
                        <option value="">Choisir la taille</option>
                        {sizesList.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-muted small">Aucune taille disponible</p>
                    )}

                    <button
                      className="btn btn-primary"
                      onClick={() => handleAddToCart(product)}
                    >
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
