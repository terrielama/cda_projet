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
  const [removingProductIds, setRemovingProductIds] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites");
    const favorites = storedFavorites ? JSON.parse(storedFavorites) : {};

    const likedIds = Object.keys(favorites).filter((id) => favorites[id]);
    console.log("IDs produits favoris récupérés:", likedIds);

    if (likedIds.length === 0) {
      setFavoriteProducts([]);
      return;
    }

    Promise.all(
      likedIds.map((id) =>
        api
          .get(`product/${id}/`)
          .then((res) => {
            console.log(`Produit ${id} récupéré:`, res.data);
            return res.data;
          })
          .catch((err) => {
            console.error(`Erreur récupération produit ${id}:`, err);
            return null;
          })
      )
    ).then((products) => {
      const validProducts = products.filter((p) => p !== null);
      const productsWithFullImage = validProducts.map((p) => ({
        ...p,
        image: p.image.startsWith("http") ? p.image : `http://127.0.0.1:8001${p.image}`,
      }));
      console.log("Produits favoris valides après filtrage:", productsWithFullImage);
      setFavoriteProducts(productsWithFullImage);
    });
  }, []);

  const handleSizeChange = (productId, size) => {
    console.log(`Taille sélectionnée pour produit ${productId}:`, size);
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
    setErrorMessage(""); // Clear error message on new selection
  };

  const handleAddToCart = async (product) => {
    setErrorMessage("");
    const size = selectedSizes[product.id];

    if (product.sizes?.length > 0 && !size) {
      alert("Veuillez choisir une taille avant d'ajouter au panier.");
      return;
    }

    try {
      const payload = {
        cart_code: cartCode,
        item_id: product.id,
        quantity: 1,
      };
      if (size) payload.size = size;

      console.log("Requête ajout panier, payload:", payload);

      await api.post("add_item", payload);

      setRemovingProductIds((prev) => new Set(prev).add(product.id));

      setTimeout(() => {
        console.log(`Produit ${product.id} retiré de la liste des favoris après ajout au panier.`);
        setFavoriteProducts((prev) => prev.filter((p) => p.id !== product.id));
        setRemovingProductIds((prev) => {
          const copy = new Set(prev);
          copy.delete(product.id);
          return copy;
        });

        const storedFavorites = localStorage.getItem("favorites");
        const favorites = storedFavorites ? JSON.parse(storedFavorites) : {};
        if (favorites[product.id]) {
          delete favorites[product.id];
          localStorage.setItem("favorites", JSON.stringify(favorites));
          console.log(`Produit ${product.id} supprimé de localStorage favorites.`);
        }

        alert("Produit ajouté au panier !");
      }, 500);
    } catch (error) {
      console.error("Erreur ajout au panier :", error);
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Erreur lors de l'ajout au panier, veuillez réessayer.");
      }
    }
  };

  const handleProductClick = (productId) => {
    console.log(`Navigation vers la page produit ${productId}`);
    navigate(`/produit/${productId}`);
  };

  return (
    <div className="container-fav">
      <h2 className="fav-title">Produits Favoris ❤️</h2>

      {errorMessage && <p style={{ color: "red", marginBottom: "10px" }}>{errorMessage}</p>}

      {favoriteProducts.length === 0 ? (
        <p className="no-fav-message">Aucun produit en favori pour le moment.</p>
      ) : (
        <div className="row-card">
          {favoriteProducts.map((product) => {
            // Choix tailles selon catégorie
            let sizesList = [];
            const cat = product.category?.toLowerCase() || "";

            if (cat === "boards") {
              sizesList = ["7.75", "8.0", "8.25"];
            } else if (cat === "chaussures") {
              sizesList = ["39", "40", "41"];
            } else if (cat === "sweats") {
              sizesList = ["S", "M", "L"];
            } else {
              sizesList = product.sizes || [];
            }

            // Exemple : on récupère le stock par taille dans product.stockBySize (objet { taille: stock })
            // Si pas présent, on considère toutes tailles dispo.
            // Pour chaque taille, on désactive si stock <= 0

            // On met un fallback vide si pas défini
            const stockBySize = product.stockBySize || {};

            const isSizeSelectable = sizesList.length > 0;

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

                    {isSizeSelectable ? (
                      <select
                        value={selectedSizes[product.id] || ""}
                        onChange={(e) => handleSizeChange(product.id, e.target.value)}
                        className="select-size"
                      >
                        <option value="">Choisir la taille</option>
                        {sizesList.map((size) => {
                          const stock = stockBySize[size] ?? 1; // 1 par défaut (dispo)
                          const disabled = stock <= 0;
                          return (
                            <option
                              key={size}
                              value={size}
                              disabled={disabled}
                              style={{ color: disabled ? "gray" : "black" }}
                            >
                              {size} {disabled ? "(Rupture)" : ""}
                            </option>
                          );
                        })}
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
