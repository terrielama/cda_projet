import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddButton from "./AddButton.jsx";

// Création d'une instance Axios avec baseURL
const api = axios.create({
  baseURL: "http://127.0.0.1:8001/",
});

// Map des slugs d’URL vers les catégories backend (valeurs EXACTES du champ CATEGORY Django)
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

// Fonction pour générer un cart_code unique si aucun n'est en localStorage
function generateRandomAlphanumeric(length = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const ProductList = () => {
  const { category } = useParams(); // Récupère le slug dans l’URL
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [inCart, setInCart] = useState({});

  // Récupère ou crée un cart_code stocké localement
  const [cartCode] = useState(() => {
    let code = localStorage.getItem("cart_code");
    if (!code) {
      code = generateRandomAlphanumeric();
      localStorage.setItem("cart_code", code);
      console.log("🔐 Nouveau cart_code généré :", code);
    } else {
      console.log("✅ cart_code existant utilisé :", code);
    }
    return code;
  });

  // Requête API à chaque changement de catégorie
  useEffect(() => {
    if (!category) return;

    // Traduction du slug URL vers une catégorie reconnue par le backend
    const backendCategory = categoryMap[category.toLowerCase()];
    if (!backendCategory) {
      console.error("❌ Catégorie inconnue dans categoryMap :", category);
      setProducts([]);
      return;
    }

    // Requête pour récupérer les produits de la catégorie
    api.get(`products/${backendCategory}/`)
      .then(res => {
        setProducts(res.data);
        console.log(`📦 Produits récupérés pour ${backendCategory} :`, res.data);

        // Vérifie si chaque produit est déjà dans le panier
        res.data.forEach(product => {
          api.get(`product_in_cart?cart_code=${cartCode}&product_id=${product.id}`)
            .then(response => {
              if (response.data.product_in_cart) {
                setInCart(prev => ({ ...prev, [product.id]: true }));
                console.log(`🛒 Produit ${product.id} est déjà dans le panier`);
              }
            })
            .catch(err => {
              console.error(`❗ Erreur vérif panier pour produit ${product.id} :`, err);
            });
        });
      })
      .catch(err => {
        console.error("❗ Erreur récupération produits :", err);
      });
  }, [category, cartCode]);

  // Fonction pour ajouter un produit au panier
  const add_item = (product_id) => {
    const newItem = {
      cart_code: cartCode,
      item_id: product_id,
      quantity: 1,
      size: "8.25", // Taille par défaut
    };

    api.post("add_item", newItem)
      .then(res => {
        console.log("✅ Produit ajouté :", res.data);
        setMessage("Produit ajouté au panier !");
        setInCart(prev => ({ ...prev, [product_id]: true }));
      })
      .catch(err => {
        console.error("❌ Erreur ajout panier :", err.response ? err.response.data : err.message);
      });
  };

  // Redirection vers la page de détail produit
  const handleProductClick = (productId) => {
    navigate(`/produit/${productId}`);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">{category ? category.toUpperCase() : "Produits"}</h2>
      {message && <div className="alert alert-success text-center">{message}</div>}

      <div className="row row-card">
        {products.length === 0 && <p className="text-center">Aucun produit trouvé pour cette catégorie.</p>}

        {products.map(product => {
          const priceNumber = Number(product.price);
          const priceFormatted = isNaN(priceNumber) ? "N/A" : priceNumber.toFixed(2);

          return (
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
                  <p className="card-text text-primary fw-bold">{priceFormatted}€</p>

                  <AddButton
                    onClick={() => add_item(product.id)}
                    disabled={inCart[product.id]}
                  >
                    {inCart[product.id] ? 'Déjà dans le panier' : 'Ajouter au panier'}
                  </AddButton>
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
