import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddButton from "./AddButton.jsx";

const api = axios.create({
  baseURL: "http://127.0.0.1:8001/",
});

// Map des slugs d’URL vers les catégories backend (respecte les choix Django)
const categoryMap = {
  planche: "Boards",
  trucks: "Trucks",
  grips: "Grips",
  roues: "Roues",
  sweats: "Sweats",
  vestes: "Vestes",
  chaussures: "Chaussures",
  bonnets: "Bonnets",
  ceintures: "Ceintures",
};

// Génère un cart_code alphanumérique unique
function generateRandomAlphanumeric(length = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const ProductList = () => {
  const { category } = useParams(); // Récupère la catégorie depuis l'URL
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [inCart, setInCart] = useState({});

  // Récupère ou génère le cart_code unique et le stocke en localStorage
  const [cartCode] = useState(() => {
    let code = localStorage.getItem("cart_code");
    if (!code) {
      code = generateRandomAlphanumeric();
      localStorage.setItem("cart_code", code);
      console.log("Nouveau cart_code généré et stocké :", code);
    } else {
      console.log("cart_code existant récupéré :", code);
    }
    return code;
  });

  useEffect(() => {
    if (!category) return;

    // Traduction du slug URL en catégorie backend
    const backendCategory = categoryMap[category.toLowerCase()];
    if (!backendCategory) {
      console.error("Catégorie inconnue dans la map:", category);
      setProducts([]);
      return;
    }

    // Requête API pour récupérer les produits par catégorie
    api.get(`products/${backendCategory}/`)
      .then(res => {
        setProducts(res.data);
        console.log("Produits récupérés depuis l'API :", res.data);

        // Pour chaque produit, vérifier s'il est déjà dans le panier côté backend
        res.data.forEach(product => {
          api.get(`product_in_cart?cart_code=${cartCode}&product_id=${product.id}`)
            .then(response => {
              if (response.data.product_in_cart) {
                setInCart(prev => ({ ...prev, [product.id]: true }));
                console.log(`Produit ID ${product.id} est dans le panier`);
              }
            })
            .catch(err => {
              console.error(`Erreur vérification panier produit ${product.id} :`, err);
            });
        });
      })
      .catch(err => {
        console.error("Erreur lors de la récupération des produits :", err);
      });
  }, [category, cartCode]);

  // Fonction d’ajout d’un produit au panier avec taille par défaut "8.25"
  const add_item = (product_id) => {
    const newItem = {
      cart_code: cartCode,
      item_id: product_id,
      quantity: 1,
      size: "8.25",
    };

    api.post("add_item", newItem)
      .then(res => {
        console.log("Réponse du serveur lors de l'ajout au panier :", res.data);
        setMessage("Produit ajouté au panier !");
        setInCart(prev => ({ ...prev, [product_id]: true }));
      })
      .catch(err => {
        console.error("Erreur lors de l'ajout au panier :", err.response ? err.response.data : err.message);
      });
  };

  // Navigation vers la page détail produit au clic sur l’image
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
          // Conversion sûre du prix en nombre pour éviter l'erreur toFixed
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
