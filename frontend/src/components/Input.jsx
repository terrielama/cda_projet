import React from 'react';
import styled from 'styled-components';

const Input = () => {
  return (
    <StyledWrapper>
      <div className="search">
        <input defaultChecked className="checkbox" type="checkbox" /> 
        <div className="mainbox">
          <div className="iconsearch">
            <svg viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg" className="search_icon"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" /></svg>
          </div>
          <input className="search_input" placeholder="Recherche" type="text" />
        </div>
      </div>
    </StyledWrapper>
  );
}


const StyledWrapper = styled.div`
  .search {
    position: relative;
    box-sizing: border-box;
    width: fit-content;
  }

  .mainbox {
    box-sizing: border-box;
    position: relative;
    width: 200px;
    height: 35px;
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    justify-content: center;
    border-radius: 160px;
    border: 1px solid rgba(0, 0, 0, 0.21);
    transition: all 0.3s ease;
  }
    

  .checkbox:focus {
    border: none;
    outline: none;
    
  }

  .checkbox:checked {
    right: 10px;
  }

  .checkbox:checked ~ .mainbox {
    width: 35px;
  }



  .checkbox:checked ~ .mainbox .search_input {
    width: 0;
    height: 0px;
  }

  .checkbox:checked ~ .mainbox .iconsearch {
    padding-right: 5px;
  }

  .checkbox {
    box-sizing: border-box;
    width: 30px;
    height: 35px;
    position: absolute;
    right: 17px;
    top: 10px;
    z-index: 9;
    cursor: pointer;
    appearance: none;
  }

  

  .search_input {
    box-sizing: border-box;
    height: 100%;
    width: 155px;
    background-color: transparent;
    border: none;
    outline: none;
    padding-bottom: 0px;
    padding-left: 6px;
    font-size: 0.9em;
    color: white;
    transition: all 0.3s ease;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  .search_input::placeholder {
    color: rgba(0, 0, 0, 0.78);
  }

  .iconsearch {
    box-sizing: border-box;
    padding-top: 0px;
    width: fit-content;
    transition: all 0.3s ease;
  }

  .search_icon {
    box-sizing: border-box;
    fill: black;
    font-size: 1.1em;
  }`;

export default Input;
