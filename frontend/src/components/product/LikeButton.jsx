import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const LikeButton = ({ productId }) => {
  const [isLiked, setIsLiked] = useState(false);

  // Récupère les favoris du localStorage sous forme d'objet {id: true}
  const getFavorites = () => {
    const favs = localStorage.getItem('favorites');
    return favs ? JSON.parse(favs) : {};
  };

  // Sauvegarde les favoris dans localStorage
  const saveFavorites = (favorites) => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  };

  // Sync initial : vérifier si le produit est déjà en favoris
  useEffect(() => {
    const favorites = getFavorites();
    setIsLiked(!!favorites[productId]);
  }, [productId]);

  // Toggle favoris au clic
  const onClick = () => {
    const favorites = getFavorites();
    if (favorites[productId]) {
      delete favorites[productId];
      setIsLiked(false);
    } else {
      favorites[productId] = true;
      setIsLiked(true);
    }
    saveFavorites(favorites);
  };

  return (
    <StyledWrapper>
      <button
        onClick={onClick}
        className={isLiked ? "liked" : ""}
        aria-label={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
        type="button"
      >
        {/* On peut mettre un cœur SVG inline en fallback */}
        {isLiked ? '🤍' : '🤍'}
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  button {
    border-radius: 50px;
    box-shadow: 0px 0px 5px 7px #e7413373;
    background-color:rgb(255, 255, 255);
    color: white;
    font-size: 20px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.5s ease-in-out;
    width: 40px;
    height: 40px;
    cursor: pointer;
    user-select: none;
    margin-top: -35px;
    margin-left: 250px;
    padding: 0;
  }

  button:hover {
    background-color: #f54d3e;
    box-shadow: 0px 0px 5px 3px #e7413373;
  }

  button.liked {
    background-color:rgb(255, 0, 0);
    box-shadow: 0 0 10px 5px #ff000099;
  }
`;

export default LikeButton;
