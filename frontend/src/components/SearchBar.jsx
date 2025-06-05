import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Lancer la recherche 300ms après arrêt de la saisie
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        setLoading(true);
        fetch(`http://localhost:8001/products/search/?search=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(data => {
            setResults(data);
          })
          .catch(() => {
            setResults([]);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer); // annule l'appel si on retape avant 300ms
  }, [query]);

  const handleSelect = (productId) => {
    navigate(`/produit/${productId}`);
  };

  return (
    <div style={{ marginBottom: 20, position: 'relative', width: 320 }}>
      <input
        type="text"
        placeholder="Rechercher un produit..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: '8px', width: '100%' }}
      />

      {loading && <div style={{ marginTop: 5 }}>Chargement...</div>}

      {!loading && results.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: 250,
            overflowY: 'auto',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            margin: 0,
            padding: 0,
            listStyle: 'none',
            zIndex: 1000,
          }}
        >
          {results.map((product) => (
            <li
              key={product.id}
              onClick={() => handleSelect(product.id)}
              style={{
                padding: '10px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
              }}
            >
              <strong>{product.name}</strong> – {product.price} €
            </li>
          ))}
        </ul>
      )}

      {!loading && query && results.length === 0 && (
        <div style={{ marginTop: 5 }}>Aucun produit trouvé</div>
      )}
    </div>
  );
};

export default SearchBar;
