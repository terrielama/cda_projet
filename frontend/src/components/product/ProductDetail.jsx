import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import images from '../../importImages.js';
import axios from 'axios';
import AddButton from "./AddButton.jsx"

// Instance Axios pour l'API
const api = axios.create({
  baseURL: "http://127.0.0.1:8001/",
});

const ProductDetail = () => {
  const { productId } = useParams(); // Récupère l'id produit depuis l'URL
  const [product, setProduct] = useState(null); // Stocke les infos produit
  const [quantity, setQuantity] = useState(1); // Quantité choisie
  const [size, setSize] = useState(8.25); // Taille sélectionnée (par défaut)
  const [showDetails, setShowDetails] = useState(false); // Affichage détails
  const [message, setMessage] = useState(''); // Message succès ou erreur

  // Récupère les détails du produit à l'initialisation
  useEffect(() => {
    // Simulation des produits (à remplacer par API réelle)
    const fetchedProducts = [
        {
          id: 1,
          name: 'Board ENJOY - KITTEN RIPPER HYBRID - 8.25',
          price: 65.00,
          image: images['enjoykitten.jpg'],
          description: 'Une planche de qualité supérieure pour les skateurs passionnés.',
          sizes: [8.25, 8.375],
        },
        {
          id: 2,
          name: 'Board ELEMENT - SWXE X WING - 7.75',
          price: 69.00,
          image: images['almost.jpg'],
          description: 'Planche ELEMENT pour performance et style.',
          sizes: [7.75, 8.25],
        },
        {
          id: 3,
          name: 'Board ALMOST - GRADIENT RINGS - 8.25',
          price: 75.00,
          image: images['chocolate.jpg'],
          description: 'Planche ALMOST avec design Gradient Rings.',
          sizes: [8.25, 8.5],
        },
        {
          id: 4,
          name: 'Board Chocolate - Lifted Chunk Roberts',
          price: 80.00,
          image: images['girlspike.jpg'],
          description: 'Planche Chocolate robuste et stylée.',
          sizes: [8.25, 8.375],
        },
        {
          id: 5,
          name: 'Board Girl - Spike Jonze Photo Series 2.0 Kim Deal',
          price: 85.00,
          image: images['almost.jpg'],
          description: 'Planche Girl avec photo série spéciale Kim Deal.',
          sizes: [8.25, 8.375],
        },
        {
          id: 6,
          name: 'Board Magenta - Brush Team Board',
          price: 60.00,
          image: images['magenta.jpg'],
          description: 'Planche Magenta avec design artistique unique.',
          sizes: [7.75, 8.25],
        },
        {
          id: 7,
          name: 'Board Baker Brand Logo Black',
          price: 90.00,
          image: images['baker.jpg'],
          description: 'Planche Baker avec logo classique en noir.',
          sizes: [8.25, 8.5],
        },
        {
          id: 8,
          name: 'Board Krooked - Team Staten Slick',
          price: 80.00,
          image: images['krooked.jpg'],
          description: 'Planche Krooked pour le team Staten.',
          sizes: [7.75, 8.0, 8.25],
        },
        {
          id: 9,
          name: 'Board Poetic Collective - Earth',
          price: 70.00,
          image: images['poeticcollective.jpg'],
          description: 'Planche Poetic Collective Earth Edition.',
          sizes: [8.25, 8.375],
        },
        {
          id: 10,
          name: 'Board Polar - Everything Is Normal C',
          price: 80.00,
          image: images['polar.jpg'],
          description: 'Planche Polar avec un design “Everything Is Normal”.',
          sizes: [8.25, 8.375],
        },
        {
          id: 11,
          name: 'Board Quasi De Keyzer Mental',
          price: 110.00,
          image: images['quasi.jpg'],
          description: 'Planche Quasi avec design mental unique.',
          sizes: [8.25, 8.5],
        },
        {
          id: 12,
          name: 'Board Rassvet - Titaev Pro F24',
          price: 89.00,
          image: images['rassvet.jpg'],
          description: 'Planche Rassvet édition Titaev Pro F24.',
          sizes: [8.0, 8.25, 8.375],
        },
        {
          id: 13,
          name: 'Sweatshirt Obey massive graphic',
          price: 174.99,
          image: images['obey.jpg'],
          description: 'Sweat-shirt Obey avec graphisme massif.',
          sizes: ['S', 'M', 'L'],
        },
      ];
      

    const foundProduct = fetchedProducts.find(p => p.id === parseInt(productId));
    if (foundProduct) {
      console.log("Produit trouvé :", foundProduct);
      setProduct(foundProduct);
      setSize(foundProduct.sizes[0]); // Sélection taille par défaut
    } else {
      console.warn("Produit non trouvé pour l'id :", productId);
    }
  }, [productId]);

  // Fonction pour ajouter le produit au panier
  const handleAddToCart = () => {
    const cartCode = localStorage.getItem("cart_code");
    if (!cartCode) {
      console.error("Aucun 'cart_code' dans localStorage.");
      setMessage("Erreur : aucun panier détecté. Veuillez rafraîchir la page.");
      return;
    }

    const newItem = {
      cart_code: cartCode,
      item_id: product.id,
      quantity: quantity,
      size: size, // Si taille doit être envoyée (à gérer côté backend)
    };

    console.log("Ajout au panier :", newItem);

    api.post("add_item", newItem)
      .then(res => {
        console.log("Réponse serveur ajout panier :", res.data);
        setMessage("Produit ajouté au panier !");
      })
      .catch(err => {
        console.error("Erreur ajout au panier :", err.response ? err.response.data : err.message);
        setMessage("Erreur lors de l'ajout au panier.");
      });
  };

  if (!product) return <div>Chargement...</div>;

  return (
    <div className="product-detail-container">
      <div className="product-detail-content">
        {/* Image produit */}
        <div className="product-image">
          <img src={product.image} alt={product.name} className="img-fluid" />
        </div>

        {/* Informations produit */}
        <div className="product-detail-info">
          <h2 className="product-detail-title">{product.name}</h2>
          <p className="product-detail-price">{product.price.toFixed(2)}€</p>
          
          {/* Sélecteur de taille */}
          <div className="product-detail-size-selector">
            <div className="size-buttons"> 
              <p>Taille :</p>
              {product.sizes.map((s, index) => (
                <button
                  key={index}
                  className={`size-button ${size === s ? 'selected' : ''}`}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Sélecteur de quantité */}
          <div className="product-detail-quantity-selector">
            <div className="quantity-controls">
              <label htmlFor="quantity">Quantité</label>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <input
                type="number"
                id="quantity"
                value={quantity}
                min="1"
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
           {/* Bouton d'ajout au panier */}
          <AddButton className="add-to-cart-button" onClick={handleAddToCart}>
            Ajouter au panier
          </AddButton> 
          </div>
          </div>

          

          {/* Message de confirmation */}
          {message && <div className="success-message">{message}</div>}

          {/* Toggle détails produit */}
          <button className="toggle-details-button" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Masquer les détails' : 'Détails du produit'}
          </button>

          {/* Description détaillée */}
          {showDetails && <p className="product-detail-description">{product.description}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
