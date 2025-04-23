import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from "axios";


// Import des images
import enjoyKitten from "../../assets/img/img_galerie/skateboard/Boards/enjoykitten.jpg";
import almost from '../../assets/img/img_galerie/skateboard/Boards/almost.jpg';
import chocolate from '../../assets/img/img_galerie/skateboard/Boards/chocolate.jpg';
import girlspike from '../../assets/img/img_galerie/skateboard/Boards/girlspike.jpg';
import magenta from '../../assets/img/img_galerie/skateboard/Boards/magenta.jpg';
import baker from '../../assets/img/img_galerie/skateboard/Boards/baker.jpg';
import krooked from '../../assets/img/img_galerie/skateboard/Boards/krooked.jpg';
import poeticcollective from '../../assets/img/img_galerie/skateboard/Boards/poeticcollective.jpg';
import polar from '../../assets/img/img_galerie/skateboard/Boards/polar.jpg';
import quasi from '../../assets/img/img_galerie/skateboard/Boards/quasi.jpg';
import rassvet from '../../assets/img/img_galerie/skateboard/Boards/rassvet.jpg';
import obeySweat from '../../assets/img/img_galerie/vet/Sweat/obey.png';

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
        { id: 1, name: 'Board ENJOY -  KITTEN RIPPER HYBRID - 8.25', price: 65.00, image: enjoyKitten },
        { id: 2, name: 'Board ELEMENT - SWXE X WING - 7.75', price: 69.00, image: almost },
        { id: 3, name: 'Board ALMOST - GRADIENT RINGS - 8.25', price: 75.00, image: chocolate},
        { id: 4, name: 'Board Chocolate - Lifted Chunk Roberts', price: 80.00, image: girlspike },
        { id: 5, name: 'Board Girl - Spike Jonze Photo Series 2.0 Kim Deal', price: 85.00, image: almost },
        { id: 6, name: 'Board Magenta - Brush Team Board', price: 60.00 ,image: magenta },
        { id: 7, name: 'Board Baker Brand Logo Black', price: 90.00 , image: baker },
        { id: 8, name: 'Board Krooked - Team Staten Slick', price: 80.00 , image: krooked },
        { id: 9, name: 'Board Poetic Collective - Earth', price: 70.00, image:poeticcollective },
        { id: 10, name: 'Board Polar - Everything Is Normal C', price: 80.00 , image: polar  },
        { id: 11, name: 'Board Quasi De Keyzer Mental', price: 110.00 , image: quasi  },
        { id: 12, name: 'Board Rassvet - Titaev Pro F24', price: 89.00, image: rassvet  },
      ],
      "sweat-shirts": [
        { id: 13, name: 'Sweatshirt homme Obey', price: 140.00, image: obeySweat },
      ],
    };

    if (fetchedProducts[category]) {
      setProducts(fetchedProducts[category]);
    }
  }, [category]);

  const add_item = async (product) => {
    let cart_code = localStorage.getItem("cart_code");
    if (!cart_code) {
      cart_code = generateRandomAlphanumeric();
      localStorage.setItem("cart_code", cart_code);
    }

    try {
      const response = await axios.post("http://localhost:8001/add_item", {
        cart_code: cart_code,
        product_id: product.id,
      });
      setMessage("Produit ajouté au panier !");
    } catch (error) {
      console.error(error);
      setMessage("Erreur lors de l'ajout au panier.");
    }

    setTimeout(() => setMessage(""), 3000); // message disparaît après 3 sec
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
                <button className="btn btn-dark" onClick={() => add_item(product)}>
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