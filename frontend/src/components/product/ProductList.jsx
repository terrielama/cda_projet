import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import images from '../../importImages.js';
import axios from 'axios';
import AddButton from "./AddButton.jsx";

const api = axios.create({
  baseURL: "http://127.0.0.1:8001/",
});

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
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [inCart, setInCart] = useState({});

  // Récupère ou génère le cart_code unique et le stocke en localStorage
  const [cartCode, setCartCode] = useState(() => {
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
    // Produits simulés par catégorie
    const fetchedProducts = {
      planche: [
        { id: 1, name: 'Board Enjoy - Kitten Ripper Hybrid', price: 65.00, image: images['enjoykitten.jpg'] },
        { id: 2, name: 'Board Element - SWXE X WING ', price: 69.00, image: images['element.jpg'] },
        { id: 3, name: 'Board Almost - Gradient Rings ', price: 75.00, image: images['almost.jpg'] },
        { id: 4, name: 'Board Chocolate - Lifted Chunk Roberts', price: 80.00, image: images['chocolate.jpg'] },
        { id: 5, name: 'Board Girl - Spike Jonze  Series 2.0', price: 85.00, image: images['girlspike.jpg'] },
        { id: 6, name: 'Board Magenta - Brush Team Board', price: 60.00, image: images['magenta.jpg'] },
        { id: 7, name: 'Board Baker Brand Logo Black', price: 90.00, image: images['baker.jpg'] },
        { id: 8, name: 'Board Krooked - Team Staten Slick', price: 80.00, image: images['krooked.jpg'] },
        { id: 9, name: 'Board Poetic Collective - Earth', price: 70.00, image: images['poeticcollective.jpg'] },
        { id: 10, name: 'Board Polar - Everything Is Normal C', price: 80.00, image: images['polar.jpg'] },
        { id: 11, name: 'Board Quasi De Keyzer Mental', price: 110.00, image: images['quasi.jpg'] },
        { id: 12, name: 'Board Rassvet - Titaev Pro F24', price: 89.00, image: images['rassvet.jpg'] },
      ],
      "sweat-shirts": [
        { id: 13, name: 'Sweatshirt Obey massive graphic', price: 174.99, image: images['obey.jpg'] },
      ],
    };

    if (fetchedProducts[category]) {
      setProducts(fetchedProducts[category]);
      console.log("Produits chargés pour la catégorie :", category, fetchedProducts[category]);

      // Vérifie quels produits sont déjà dans le panier côté backend
      fetchedProducts[category].forEach(product => {
        api.get(`product_in_cart?cart_code=${cartCode}&product_id=${product.id}`)
          .then(res => {
            if (res.data.product_in_cart) {
              setInCart(prev => ({ ...prev, [product.id]: true }));
              console.log(`Produit ID ${product.id} est dans le panier`);
            } else {
              console.log(`Produit ID ${product.id} n'est PAS dans le panier`);
            }
          })
          .catch(err => {
            console.error(`Erreur vérification panier produit ${product.id} :`, err);
          });
      });
    }
  }, [category, cartCode]);

  // Fonction pour ajouter un produit au panier avec taille par défaut "8.25"
  const add_item = (product_id) => {
    const newItem = {
      cart_code: cartCode,
      item_id: product_id,
      quantity: 1,
      size: "8.25",  // taille envoyée au backend
    };

    api.post("add_item", newItem)
      .then(res => {
        console.log("Réponse du serveur :", res.data);
        setMessage("Produit ajouté au panier !");
        setInCart(prev => ({ ...prev, [product_id]: true }));
      })
      .catch(err => {
        console.error("Erreur lors de l'ajout au panier :", err.response ? err.response.data : err.message);
      });
  };

  const handleProductClick = (productId) => {
    navigate(`/produit/${productId}`);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">{category?.toUpperCase()}</h2>
      {message && <div className="alert alert-success text-center">{message}</div>}

      <div className="row row-card">
        {products.map(product => (
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
                <p className="card-text text-primary fw-bold">{product.price.toFixed(2)}€</p>

                {/* Pas de sélection de taille côté frontend */}

                <AddButton
                  onClick={() => add_item(product.id)}
                  disabled={inCart[product.id]}
                >
                  {inCart[product.id] ? 'Déjà dans le panier' : 'Ajouter au panier'}
                </AddButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
