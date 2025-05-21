import React from 'react';
import styled from 'styled-components';

const AddButton = ({ onClick }) => {
  return (
    <StyledWrapper>
      <button type="button" className="addbutton" onClick={onClick}>
        <span className="addbutton__text">Ajouter au panier</span>
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
  width: 175px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border: 1px solid rgb(52, 151, 77);
  background-color:rgb(2, 134, 35);
  border-radius: 5px;
  margin: 0 auto; /* Centrage horizontal */
}


  .addbutton,
  .addbutton__icon,
  .addbutton__text {
    transition: all 0.3s;
  }

  .addbutton .addbutton__text {
    transform: translateX(20px); /* réduit pour créer plus d'espace avec l'icône */
    color: #fff;
    font-weight: 600;
    font-size: 12px;
  }

  .addbutton .addbutton__icon {
    position: absolute;
    transform: translateX(145px);
    height: 100%;
    width: 30px;
    background-color: #34974d;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }


  .addbutton .svg {
    width: 30px;
    stroke: #fff;
  }

  .addbutton:hover {
    background: #34974d;
  }

  .addbutton:hover .addbutton__text {
    color: transparent;
  }

  .addbutton:hover .addbutton__icon {
    width: 175px;
    transform: translateX(0);
  }

  .addbutton:active .addbutton__icon {
    background-color: #2e8644;
  }

  .addbutton:active {
    border: 1px solid #2e8644;
  }
`;

export default AddButton;
