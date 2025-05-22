import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import images from '../../importImages.js';
import axios from 'axios';
import AddButton2 from "./AddButton2.jsx";

// Création de l'instance Axios
const api = axios.create({
  baseURL: "http://127.0.0.1:8001/",
});

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(8.25);
  const [showDetails, setShowDetails] = useState(false);
  const [message, setMessage] = useState('');
  const [cartCode, setCartCode] = useState('');
  const [inCart, setInCart] = useState(false);

  // Simule les produits — à remplacer par une API réelle plus tard
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

  // Récupère les détails du produit à l'initialisation
  useEffect(() => {
    const code = localStorage.getItem("cart_code");
    if (!code) {
      console.warn("Aucun cart_code détecté !");
    }
    setCartCode(code);

    const foundProduct = fetchedProducts.find(p => p.id === parseInt(productId));
    if (foundProduct) {
      console.log("Produit trouvé :", foundProduct);
      setProduct(foundProduct);
      setSize(foundProduct.sizes[0]);

      if (code) {
        api.get(`product_in_cart?cart_code=${code}&product_id=${foundProduct.id}`)
          .then(res => {
            if (res.data.product_in_cart) {
              setInCart(true);
              console.log(`Produit ID ${foundProduct.id} est déjà dans le panier`);
            } else {
              console.log(`Produit ID ${foundProduct.id} n'est pas encore dans le panier`);
            }
          })
          .catch(err => {
            console.error("Erreur vérification panier :", err);
          });
      }
    } else {
      console.warn("Produit introuvable pour l'ID :", productId);
    }
  }, [productId]);

  // Gestion ajout au panier
  const handleAddToCart = () => {
    if (!cartCode || !product) {
      console.error("Impossible d'ajouter : cartCode ou produit manquant");
      setMessage("Erreur : panier ou produit non défini.");
      return;
    }

    const newItem = {
      cart_code: cartCode,
      item_id: product.id,
      quantity: quantity,
      size: size,
    };

    console.log("Ajout du produit au panier :", newItem);

    api.post("add_item", newItem)
      .then(res => {
        console.log("Réponse ajout :", res.data);
        setMessage("Produit ajouté au panier !");
        setInCart(true);
      })
      .catch(err => {
        console.error("Erreur ajout :", err.response ? err.response.data : err.message);
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

        {/* Infos produit */}
        <div className="product-detail-info">
          <h2 className="product-detail-title">{product.name}</h2>
          <p className="product-detail-price">{product.price.toFixed(2)}€</p>

          {/* Sélecteur de taille */}
          <div className="product-detail-size-selector">
            <p>Taille :</p>
            <div className="size-buttons">
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
            <p>Quantité</p>
            <div className="quantity-controls">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <input
                type="number"
                value={quantity}
                min="1"
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            {/* Bouton d'ajout au panier */}
          <AddButton2 className="add-to-cart-button" onClick={handleAddToCart}>
            {inCart ? "Déjà dans le panier" : "Ajouter au panier"}
          </AddButton2>
          </div>
        </div>

          {/* Détails supplémentaires */}
          <button className="toggle-details-button" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? "Masquer les détails" : "Détails du produit"}
          </button>
          {showDetails && <p className="product-detail-description">{product.description}</p>}
        {/* Message de succès ou erreur */}
          {message && <div className="success-message">{message}</div>}
          </div>
    
        </div>
    </div>
  );
};

export default ProductDetail;
