// SMOButton : button See my order : voir ma commande

import React from 'react';
import styled from 'styled-components';

const SMOButton = ({ onClick, disabled }) => {
  return (
    <StyledWrapper>
      <button className="cta" onClick={onClick} disabled={disabled}>
        <span className="hover-underline-animation">Voir ma commande</span>
        <svg
          id="arrow-horizontal"
          xmlns="http://www.w3.org/2000/svg"
          width={30}
          height={10}
          viewBox="0 0 46 16"
        >
          <path
            id="Path_10"
            d="M8,0,6.545,1.455l5.506,5.506H-30V9.039H12.052L6.545,14.545,8,16l8-8Z"
            transform="translate(30)"
          />
        </svg>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .cta {
    border: none;
    background-color: #34974d;
    padding: 15px 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border-radius: 5px;
    color: white;
    transition: background 0.3s ease;
  }

  .cta[disabled] {
    background-color: #fff;
    cursor: not-allowed;
  }

  .cta span {
    padding-bottom: 7px;
    letter-spacing: 2px;
    font-size: 14px;
    padding-right: 15px;
    text-transform: uppercase;
  }

  .cta svg {
    transform: translateX(-8px);
    transition: all 0.3s ease;
    fill: white;
  }

  .cta:hover svg {
    transform: translateX(0);
  }

  .cta:active svg {
    transform: scale(0.9);
  }

  .hover-underline-animation {
    position: relative;
    color: white;
    padding-bottom: 20px;
  }

  .hover-underline-animation:after {
    content: "";
    position: absolute;
    width: 100%;
    transform: scaleX(0);
    height: 2px;
    bottom: 0;
    left: 0;
    background-color: #fff;
    transform-origin: bottom right;
    transition: transform 0.25s ease-out;
  }

  .cta:hover .hover-underline-animation:after {
    transform: scaleX(1);
    transform-origin: bottom left;
  }
`;

export default SMOButton;