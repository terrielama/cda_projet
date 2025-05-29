import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const LikeIcone = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/favoris'); // redirige vers FavoritesPage
  };

  return (
    <StyledWrapper>
      <label className="container" aria-label="Voir les favoris" onClick={handleClick}>
        <input type="checkbox" />
        <div className="checkmark" aria-hidden="true">
          <svg viewBox="0 0 256 256" width="32" height="32">
            <rect fill="none" height={256} width={256} />
            <path 
              d="M224.6,51.9a59.5,59.5,0,0,0-43-19.9,60.5,60.5,0,0,0-44,17.6L128,59.1l-7.5-7.4C97.2,28.3,59.2,26.3,35.9,47.4a59.9,59.9,0,0,0-2.3,87l83.1,83.1a15.9,15.9,0,0,0,22.6,0l81-81C243.7,113.2,245.6,75.2,224.6,51.9Z"
              strokeWidth="20px"
              stroke="#000"
              fill="red"
            />
          </svg>
        </div>
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .container {
    position: relative;
    display: inline-block;
    cursor: pointer;
    user-select: none;
    transition: transform 100ms;
    margin-top: 16px;
  }

  .container input {
    position: absolute;
    opacity: 0;
    height: 30px;
    width: 30px;
    margin: 0;
    cursor: pointer;
  }

  .checkmark {
    height: 20px;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 400ms ease;
  }

  .container:hover {
    transform: scale(1.1);
  }
`;

export default LikeIcone;
