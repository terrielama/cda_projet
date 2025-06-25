import React from 'react';
import styled from 'styled-components';

const AddButton = ({ onClick, disabled = false, children, title, outOfStock = false }) => {
  return (
    <StyledWrapper outOfStock={outOfStock}>
      <button
        type="button"
        className={`addbutton ${outOfStock ? 'outofstock' : ''}`}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        title={title}
      >
        <span className="addbutton__text">{children || 'Ajouter au panier'}</span>
        <span className="addbutton__icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            className="svg"
          >
            <line x1={12} y1={5} x2={12} y2={19} />
            <line x1={5} y1={12} x2={19} y2={12} />
          </svg>
        </span>
      </button>
    </StyledWrapper>
  );
};


const StyledWrapper = styled.div`
  .addbutton {
    position: relative;
    width: 155px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    border: 1px solid rgb(52, 151, 77);
    background-color: rgb(2, 134, 35);
    border-radius: 5px;
    margin: 20px auto;
   
    opacity: 1;
    transition: opacity 0.3s;
  }

  .addbutton:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    background-color: #a5d6a7;
    border-color: #81c784;
  }

  .addbutton,
  .addbutton__icon,
  .addbutton__text {
    transition: all 0.3s;
  }

  .addbutton .addbutton__text {
    transform: translateX(8px);
    color: #fff;
    font-weight: 600;
    font-size: 12px;
  }

  .addbutton.outofstock {
  background-color:rgb(255, 0, 0);
  border-color: #b71c1c;
  color: white;
}

.addbutton.outofstock .addbutton__text {
  color: white;
}

.addbutton.outofstock .addbutton__icon {
  display: none; /* Cache l'icône pour un bouton épuisé */
}


  .addbutton .addbutton__icon {
    position: absolute;
    transform: translateX(123px);
    height: 100%;
    width: 30px;
    background-color: #34974d;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  .addbutton:disabled .addbutton__icon {
    background-color: #81c784;
  }

  .addbutton .svg {
    width: 30px;
    stroke: #fff;
  }

  .addbutton:hover:not(:disabled) {
    background: #34974d;
  }

  .addbutton:hover:not(:disabled) .addbutton__text {
    color: transparent;
  }

  .addbutton:hover:not(:disabled) .addbutton__icon {
    width: 155px;
    transform: translateX(0);
  }

  .addbutton:active:not(:disabled) .addbutton__icon {
    background-color: #2e8644;
  }

  .addbutton:active:not(:disabled) {
    border: 1px solid #2e8644;
  }
`;

export default AddButton;
