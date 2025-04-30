import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import images from '../../importImages.js';
import axios from 'axios';

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
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchedProducts = {
      planche: [
        { id: 1, name: 'Board ENJOY - KITTEN RIPPER HYBRID - 8.25', price: 65.00, image: images['enjoykitten.jpg'] },
        { id: 2, name: 'Board ELEMENT - SWXE X WING - 7.75', price: 69.00, image: images['almost.jpg'] },
        { id: 3, name: 'Board ALMOST - GRADIENT RINGS - 8.25', price: 75.00, image: images['chocolate.jpg'] },
        { id: 4, name: 'Board Chocolate - Lifted Chunk Roberts', price: 80.00, image: images['girlspike.jpg'] },
        { id: 5, name: 'Board Girl - Spike Jonze Photo Series 2.0 Kim Deal', price: 85.00, image: images['almost.jpg'] },
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
    }
  }, [category]);

  const addItem = async (product) => {
    let cartCode = localStorage.getItem("cart_code");
    if (!cartCode) {
      cartCode = generateRandomAlphanumeric();
      localStorage.setItem("cart_code", cartCode);
    }

    try {
      await axios.post("http://localhost:8001/add_item", {
        cart_code: cartCode,
        product_id: product.id,
      });
      setMessage("Produit ajouté au panier !");
    } catch (error) {
      console.error(error);
      setMessage("Erreur lors de l'ajout au panier.");
    }

    setTimeout(() => setMessage(""), 3000); // Efface le message après 3 secondes
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">{category?.toUpperCase()}</h2>
      {message && <div className="alert alert-success text-center">{message}</div>}

      <div className="row row-card">
        {products.map((product) => (
          <div key={product.id} className="col-md-4 mb-4">
            <div className="card shadow-sm">
              <img src={product.image} className="card-img-top" alt={product.name} />
              <div className="card-body text-center">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text text-primary fw-bold">{product.price.toFixed(2)}€</p>
                <button className="btn btn-dark" onClick={() => addItem(product)}>
                  Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
