import React, { useContext } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 

const AccountButton = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
  
    const handleClick = () => {
      navigate('/profile');
    };
  
    return (
      <StyledWrapper>
<button id="btn-message" className="button-message" onClick={handleClick}>
  <div className="content-avatar">
    <div className="status-user"></div>
    <div className="avatar">
      <svg className="user-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M12,12.5c-3.04,0-5.5,1.73-5.5,3.5s2.46,3.5,5.5,3.5,5.5-1.73,5.5-3.5-2.46-3.5-5.5-3.5Zm0-.5c1.66,0,3-1.34,3-3s-1.34-3-3-3-3,1.34-3,3,1.34,3,3,3Z" />
      </svg>
    </div>
  </div>
  <div className="notice-content">
    <div className="username">{user?.first_name} {user?.last_name}</div>
    <div className="lable-message">Connecté</div>
  </div>
</button>

      </StyledWrapper>
    );
  };

  const StyledWrapper = styled.div`
  #btn-message {
    --text-color: rgb(255, 255, 255);
    --bg-color-sup: #5e5e5e;
    --bg-color: #2b2b2b;
    --bg-hover-color: #161616;
    --online-status: #00da00;
    --font-size: 16px;
    --btn-transition: all 0.2s ease-out;
  }

  .button-message {
    margin-left: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    font: 200 var(--font-size) Helvetica Neue, sans-serif;
    box-shadow: 0 0 2.17382px rgba(0, 0, 0, 0.91),0 1.75px 6.01034px rgba(0,0,0,.07),0 3.63px 14.4706px rgba(0,0,0,.091),0 22px 48px rgba(0,0,0,.14);
    background-color: var(--bg-color);
    border-radius: 68px;
    cursor: pointer;
    padding: 2px 0px 2px 0px;
    width: 120px;
    height: 40px;
    border: 0;
    overflow: hidden;
    position: relative;
    transition: var(--btn-transition);
  }

  .button-message:hover {
    height: 40px;
    padding: 5px 6px 5px 6px;
    background-color: var(--bg-hover-color);
    transition: var(--btn-transition);
  }

  .button-message:active {
    transform: scale(0.90);
  }

  .content-avatar {
    width: 23px;
    height: 20px;
    transition: var(--btn-transition);
    position: relative;
    margin-left:10px;
  }


  .avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    background-color: var(--bg-color-sup);
  }

  .user-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .status-user {
    position: absolute;
    width: 5px;
    height: 5px;
    right: 1px;
    bottom: 1px;
    border-radius: 50%;
    outline: solid 2px var(--bg-color);
    background-color: var(--online-status);
    transition: var(--btn-transition);
    animation: active-status 2s ease-in-out infinite;
  }


  .notice-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding-left: 8px;
    text-align: initial;
    color: var(--text-color);
  }

  .username {
    height: 0;
    opacity: 0;
    transform: translateY(-20px);
    transition: var(--btn-transition);
  }


  .lable-message {
    font-size: 13px;
    display: flex;
    align-items: center;
    opacity: 1;
    transform: scaleY(1);
    transition: var(--btn-transition);
  }

  .button-message:hover .username {
    height: auto;
    letter-spacing: normal;
    opacity: 1;
    font-size: 12px;
    transform: translateY(0);
    transition: var(--btn-transition);
  }

  .button-message:hover .user-id {
    height: auto;
    letter-spacing: normal;
    opacity: 1;
    transform: translateY(0);
    transition: var(--btn-transition);
  }

  .button-message:hover .lable-message {
    height: 0;
    transform: scaleY(0);
    padding-right: 5px;
    transition: var(--btn-transition);
  }

  .lable-message, .username {
    font-weight: 600;
  }

  @media (max-width: 480px) {
   .button-message{
     width: 95px;

  }

 .lable-message{
 font-size:11px;
 }

  .user-img,
  .content-avatar
     {
      width:20px;
     height:20px;
     margin-right:-2px;
     }

 .button-message:hover .lable-message {
    margin-right: -5px;
    }
     
  }
  



  /*==============================================*/
  @keyframes active-status {
    0% {
      background-color: var(--online-status);
    }

    33.33% {
      background-color: #93e200;
    }

    66.33% {
      background-color: #93e200;
    }

    100% {
      background-color: var(--online-status);
    }
  }`;



export default AccountButton;
