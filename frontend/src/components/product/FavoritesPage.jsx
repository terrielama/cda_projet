import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AddButton from "./AddButton";

const api = axios.create({
  baseURL: "http://127.0.0.1:8001/",
});

// Génère un code alphanumérique aléatoire pour identifier le panier
function generateRandomAlphanumeric(length = 12) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const FavoritesPage = () => {
  const navigate = useNavigate();

  // Cart code stocké ou généré une fois
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

  // Liste des produits favoris (détails)
  const [favoriteProducts, setFavoriteProducts] = useState([]);

  // Tailles sélectionnées par produit
  const [selectedSizes, setSelectedSizes] = useState({});

  // Id des produits en train d'être retirés (animation)
  const [removingProductIds, setRemovingProductIds] = useState(new Set());

  // Chargement des favoris au montage
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites");
    const favorites = storedFavorites ? JSON.parse(storedFavorites) : {};

    const likedIds = Object.keys(favorites).filter((id) => favorites[id]);
    if (likedIds.length === 0) {
      setFavoriteProducts([]);
      return;
    }

    Promise.all(
      likedIds.map((id) =>
        api
          .get(`product/${id}/`)
          .then((res) => res.data)
          .catch(() => null)
      )
    ).then((products) => {
      const validProducts = products.filter((p) => p !== null);
      // Corrige les URLs d'images si besoin
      const productsWithFullImage = validProducts.map((p) => ({
        ...p,
        image: p.image.startsWith("http") ? p.image : `http://127.0.0.1:8001${p.image}`,
      }));
      setFavoriteProducts(productsWithFullImage);
    });
  }, []);

  // Change la taille sélectionnée pour un produit
  const handleSizeChange = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  // Ajoute le produit au panier puis supprime des favoris avec animation
  const handleAddToCart = async (product) => {
    const size = selectedSizes[product.id];
    if (product.sizes?.length > 0 && !size) {
      alert("Veuillez choisir une taille avant d'ajouter au panier.");
      return;
    }

    try {
      await api.post("add_item", {
        cart_code: cartCode,
        item_id: product.id,
        quantity: 1,
        size: size || null,
      });

      // Démarre l'animation de disparition
      setRemovingProductIds((prev) => new Set(prev).add(product.id));

      // Supprime après la fin de l'animation (500ms)
      setTimeout(() => {
        // Retire le produit de la liste visible
        setFavoriteProducts((prev) => prev.filter((p) => p.id !== product.id));

        // Retire de la liste de suppression
        setRemovingProductIds((prev) => {
          const copy = new Set(prev);
          copy.delete(product.id);
          return copy;
        });

        // Met à jour localStorage (supprime des favoris)
        const storedFavorites = localStorage.getItem("favorites");
        const favorites = storedFavorites ? JSON.parse(storedFavorites) : {};
        if (favorites[product.id]) {
          delete favorites[product.id];
          localStorage.setItem("favorites", JSON.stringify(favorites));
        }

        alert("Produit ajouté au panier !");
      }, 500);
    } catch (error) {
      console.error("Erreur ajout au panier :", error);
      alert("Erreur lors de l'ajout au panier, veuillez réessayer.");
    }
  };

  // Clique sur image pour aller au détail produit
  const handleProductClick = (productId) => {
    navigate(`/produit/${productId}`);
  };

  return (
    <div className="container-fav">
      <h2 className="fav-title">Produits Favoris ❤️</h2>

      {favoriteProducts.length === 0 ? (
        <p className="no-fav-message">Aucun produit en favori pour le moment.</p>
      ) : (
        <div className="row-card">
          {favoriteProducts.map((product) => {
            // Choix tailles selon catégorie
            let sizesList = [];
            const cat = product.category?.toLowerCase() || "";

            if (cat === "boards") {
              sizesList = ["7.5", "7.75", "8.0", "8.25"];
            } else if (cat === "chaussures") {
              sizesList = ["38", "39", "40", "41", "42", "43", "44"];
            } else if (cat === "sweats") {
              sizesList = ["S", "M", "L"];
            } else {
              sizesList = product.sizes || [];
            }

            return (
              <div
                key={product.id}
                className={`transition-card ${
                  removingProductIds.has(product.id) ? "fade-out" : "fade-in"
                }`}
              >
                <div className="card-fav">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="card-fav-img"
                    onClick={() => handleProductClick(product.id)}
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  />
                  <div className="card-body-fav">
                    <h5 className="card-title text-uppercase">{product.name}</h5>
                    <p className="card-text">{parseFloat(product.price).toFixed(2)}€</p>

                    {sizesList.length > 0 ? (
                      <select
                        value={selectedSizes[product.id] || ""}
                        onChange={(e) => handleSizeChange(product.id, e.target.value)}
                        className="select-size"
                      >
                        <option value="">Choisir la taille</option>
                        {sizesList.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-muted">Aucune taille disponible</p>
                    )}

                    <AddButton onClick={() => handleAddToCart(product)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
