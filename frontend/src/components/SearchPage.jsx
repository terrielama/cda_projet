import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const SearchPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Récupérer le paramètre search dans l'URL (et non query)
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const searchTerm = queryParams.get('search') || '';

  useEffect(() => {
    if (!searchTerm) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError(null);

    const apiUrl = `http://localhost:8001/products/search/?search=${encodeURIComponent(searchTerm)}`;

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchTerm]);

  return (
    <div>
      <h2>Résultats pour : "{searchTerm}"</h2>

      {loading && <p>Chargement en cours...</p>}
      {error && <p style={{ color: 'red' }}>Erreur : {error}</p>}

      {!loading && !error && products.length === 0 && <p>Aucun produit trouvé.</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {products.map((p) => (
          <li key={p.id} style={{ marginBottom: 20, borderBottom: '1px solid #ddd', paddingBottom: 10 }}>
            <h3>{p.name}</h3>
            <img src={p.image} alt={p.name} style={{ maxWidth: 150, display: 'block' }} />
            <p>Prix : {p.price} €</p>
            <p>Catégorie : {p.category}</p>
            <p>{p.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchPage;
