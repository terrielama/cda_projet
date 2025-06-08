import React from 'react';
import styled from 'styled-components';

const AddButton2 = ({ onClick, children }) => {
  return (
    <StyledWrapper>
      <button className="button" onClick={onClick}>
        <span>{children}</span>
        <svg fill="#fff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g strokeWidth={0} id="SVGRepo_bgCarrier" />
          <g strokeLinejoin="round" strokeLinecap="round" id="SVGRepo_tracerCarrier" />
          <g id="SVGRepo_iconCarrier">
            <defs></defs>
            <g id="cart">
              <circle r="1.91" cy="20.59" cx="10.07" className="cls-1" />
              <circle r="1.91" cy="20.59" cx="18.66" className="cls-1" />
              <path d="M.52,1.5H3.18a2.87,2.87,0,0,1,2.74,2L9.11,13.91H8.64A2.39,2.39,0,0,0,6.25,16.3h0a2.39,2.39,0,0,0,2.39,2.38h10" className="cls-1" />
              <polyline points="7.21 5.32 22.48 5.32 22.48 7.23 20.57 13.91 9.11 13.91" className="cls-1" />
            </g>
          </g>
        </svg>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
.button {
  height: 45px;
  width: 150px;
  background-color: rgb(1, 135, 34);
  border: 2px solid rgb(18, 137, 48);
  color: #eee;
  transition: width 0.6s ease, border-radius 0.6s ease;
  font-size: 13px;
  font-weight: bold;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  overflow: hidden;
  position: relative;
  padding-right: 15px;
  margin-left: 15px;
}

.button span {
  transform: translateX(10px);
  transition: 0.7s ease;
  white-space: nowrap;
  position: absolute;
}

.button svg {
  transition: 0.5s ease;
  height: 23px;
  width: 23px;
  fill: white;
  position: absolute;
  transform: translateX(-400%);
}

.button:hover {
  padding-left: 15px;
  width: 50px;
  border-radius: 50%;
  background-color: rgb(0, 139, 35);
  box-shadow: 20px 20px 96px rgba(0, 204, 31, 0.69), -20px -20px 96px rgba(0, 255, 38, 0.41);
}

.button:hover svg {
  transform: translateX(0);
}

.button:hover span {
  transform: translateY(60px);
  font-size: 0.1rem;
}

`;

export default AddButton2;
