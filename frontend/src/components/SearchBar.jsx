import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (query.trim()) {
        setLoading(true);
        fetch(`http://localhost:8001/products/search/?search=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(data => setResults(data))
          .catch(err => {
            console.error('Erreur API :', err);
            setResults([]);
          })
          .finally(() => setLoading(false));
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id) => {
    navigate(`/produit/${id}`);
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <Wrapper ref={wrapperRef}>
      <SearchBox isOpen={isOpen}>
        <SearchToggle onClick={() => setIsOpen(prev => !prev)}>
          <SearchIcon viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
          </SearchIcon>
        </SearchToggle>

        <SearchInput
          isOpen={isOpen}
          placeholder="Rechercher un produit..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </SearchBox>

      {isOpen && (
        <>
          {loading && <Message>Chargement...</Message>}

          {!loading && results.length > 0 && (
            <ResultsList>
              {results.map(product => (
                <ResultItem key={product.id} onClick={() => handleSelect(product.id)}>
                  <strong>{product.name}</strong> – {product.price} €
                </ResultItem>
              ))}
            </ResultsList>
          )}

          {!loading && query && results.length === 0 && (
            <Message>Aucun produit trouvé</Message>
          )}
        </>
      )}
    </Wrapper>
  );
};

export default SearchBar;

// === Styled Components ===

const Wrapper = styled.div`
  position: relative;
  max-width: 300px;
  margin: 0 auto;
  z-index: 10;
  border: 1px solid #ccc;
  border-radius:50%;
  margin-right: 7px;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  border-radius: 50px;
  background-color: #fff;
  transition: all 0.3s ease;
  border: ${({ isOpen }) => (isOpen ? '1px solid #ccc' : 'none')};
  padding: ${({ isOpen }) => (isOpen ? '1px 4px' : '6px')};
  box-shadow: ${({ isOpen }) => (isOpen ? '0 2px 6px rgba(0,0,0,0.1)' : 'none')};
`;

const SearchToggle = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.svg`
  width: 17px;
  height: 20px;
  fill: black;
  margin-left: 2px;
`;

const SearchInput = styled.input`
  width: ${({ isOpen }) => (isOpen ? '150px' : '0')};
  margin-left: ${({ isOpen }) => (isOpen ? '1px' : '0')};
  padding: ${({ isOpen }) => (isOpen ? '6px 10px' : '0')};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  border: none;
  outline: none;
  font-size: 12px;
  background-color: transparent;
  transition: all 0.3s ease;

  @media (max-width: 600px) {
    width: ${({ isOpen }) => (isOpen ? '140px' : '0')};
    font-size: 0.95rem;
  }
`;

const ResultsList = styled.ul`
  position: absolute;
  top: 90%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  max-height: 250px;
  overflow-y: auto;
  list-style: none;
  margin: 5px 0 0;
  padding: 0;
  z-index: 1000;
`;

const ResultItem = styled.li`
  padding: 10px 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #f0f0f0;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Message = styled.div`
  margin-top: 6px;
  font-size: 14px;
  color: #555;
`;
