import React from "react";
import styled from "styled-components";

const AddButton2 = ({ onClick, children, outOfStock }) => {
  const disabled = outOfStock;
  const title = outOfStock ? "Article épuisé" : "Ajouter au panier";

  return (
    <StyledWrapper>
     <button
  type="button"
  className="button"
  onClick={disabled ? undefined : onClick}
  disabled={disabled}
  title={title}
>

        <span>{disabled ? "Article épuisé" : children}</span>

        {/* Icône uniquement si produit en stock */}
        {!disabled && (
          <svg
            fill="#fff"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <g id="SVGRepo_iconCarrier">
              <g id="cart">
                <circle r="1.91" cy="20.59" cx="10.07" />
                <circle r="1.91" cy="20.59" cx="18.66" />
                <path
                  d="M.52,1.5H3.18a2.87,2.87,0,0,1,2.74,2L9.11,13.91H8.64A2.39,2.39,0,0,0,6.25,16.3h0a2.39,2.39,0,0,0,2.39,2.38h10"
                />
                <polyline points="7.21 5.32 22.48 5.32 22.48 7.23 20.57 13.91 9.11 13.91" />
              </g>
            </g>
          </svg>
        )}
      </button>
      
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .button {
    height: 45px;
    width: 150px;
    background-color:  rgb(0, 168, 42);
    border: 2px solid rgb(18, 137, 48);
    color: #eee;
    font-size: 13px;
    font-weight: bold;
    border-radius: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    padding-right: 15px;
    margin-left: 15px;
    cursor: pointer;
    overflow: hidden;
    position: relative;
    transition:
      width 0.6s ease,
      border-radius 0.6s ease,
      background-color 0.3s ease,
      border-color 0.3s ease,
      color 0.3s ease;
  }

  .button span {
    position: absolute;
    white-space: nowrap;
    transform: translateX(10px);
    transition: transform 0.7s ease, font-size 0.3s ease;
  }

  .button svg {
    position: absolute;
    height: 23px;
    width: 23px;
    fill: white;
    transform: translateX(-400%);
    transition: transform 0.5s ease;
  }

  .button:disabled {
    height: 45px;
    width: 150px;
    background-color: rgb(242, 0, 0);
    border: 2px solid rgb(255, 0, 0);
    color: #eee;
    font-size: 13px;
    font-weight: bold;
    border-radius: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    padding-right: 15px;
    margin-left: 15px;
    cursor: pointer;
    overflow: hidden;
    position: relative;
    transition:
      width 0.6s ease,
      border-radius 0.6s ease,
      background-color 0.3s ease,
      border-color 0.3s ease,
      color 0.3s ease;
  }

  .button:hover:not(:disabled) {
    width: 50px;
    border-radius: 50%;
    padding-left: 15px;
    background-color:  rgb(0, 168, 42);
    box-shadow:
      20px 20px 96px rgba(75, 224, 0, 0.69),
      -20px -20px 96px rgba(30, 200, 0, 0.41);
  }

  .button:hover:not(:disabled) svg {
    transform: translateX(0);
  }

  .button:hover:not(:disabled) span {
    transform: translateY(60px);
    font-size: 0.1rem;
  }

  .button:disabled {
    background-color: #d32f2f !important;
    border-color: #b71c1c !important;
    color: #eee !important;
    cursor: not-allowed !important;
    box-shadow: none !important;
    width: 150px !important;
    border-radius: 50px !important;
    padding-left: 0 !important;
    transition: none !important;
  }

  .button:disabled span {
    transform: translateX(10px);
    font-size: 13px;
  }

  .button:disabled:hover {
    background-color: #b71c1c !important;
    box-shadow: none !important;
  }
`;

export default AddButton2;
