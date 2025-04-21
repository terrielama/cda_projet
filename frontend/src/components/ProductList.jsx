import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ProductList = () => {
  const { category } = useParams(); 
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchedProducts = [
      { id: 1, name: 'Planche A', category: 'planche', price: 30 },
      { id: 2, name: 'Planche B', category: 'planche', price: 35 },
      { id: 3, name: 'Produit A', category: 'accessoire', price: 10 },
      { id: 4, name: 'Produit B', category: 'accessoire', price: 15 }
    ];

    const filteredProducts = fetchedProducts.filter(
      (product) => product.category === category
    );

    setProducts(filteredProducts);
  }, [category]);

  const addToCart = (product) => {
    // logique pour ajouter au panier
    console.log("Ajouté :", product);
    setMessage(`"${product.name}" a été ajouté au panier.`);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">{category?.toUpperCase()}</h2>
      
      {message && <div className="alert alert-success text-center">{message}</div>}
      
      <div className="row row-card">
        {products.map((product) => (
          <div key={product.id} className="col-md-4 mb-4">
            <div className="card shadow-sm">
              {/* Placeholder d'image temporaire */}
              <img src={product.image || "https://via.placeholder.com/150"} className="card-img-top" alt={product.name} />
              <div className="card-body text-center">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text text-primary fw-bold">{product.price.toFixed(2)}€</p>
                <button className="btn btn-dark" onClick={() => addToCart(product)}>
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
