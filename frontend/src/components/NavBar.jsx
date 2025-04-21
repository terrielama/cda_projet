import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import userIcon from '../assets/img/icon/user.svg';
import shoppingIcon from '../assets/img/icon/shopping.svg';
import logo from '../assets/img/img_page_accueil/logo.png';


import Input from './Input';
// import SignInForm from '../SignInForm';

const NavBar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleProfileRedirect = () => {
    isUserLoggedIn ? navigate('/') : toggleModal();
  };



  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          {/* Logo à gauche */}
          <Link className="navbar-brand" to="/">
            <img src={logo} alt="Skate Paradise" />
          </Link>

          {/* Toggle Button */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation centrale */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown1" role="button" data-bs-toggle="dropdown">
                  Skateboard
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/produits/planche">Planches de skate</Link></li>
                  <li><Link className="dropdown-item" to="/produits/roues">Roues</Link></li>
                  <li><Link className="dropdown-item" to="/produits/grips">Grips</Link></li>
                  <li><Link className="dropdown-item" to="/produits/trucks">Trucks</Link></li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownVêtements" role="button" data-bs-toggle="dropdown">
                  Vêtements
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/produits/sweat-shirts">Sweat-shirts</Link></li>
                  <li><Link className="dropdown-item" to="/produits/jeans">Jeans</Link></li>
                </ul>
              </li>
              <li className="nav-item"><Link className="nav-link" to="/produits/chaussures">Chaussures</Link></li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown2" role="button" data-bs-toggle="dropdown">
                  Accessoires
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/produits/bonnets">Bonnets</Link></li>
                  <li><Link className="dropdown-item" to="/produits/ceintures">Ceintures</Link></li>
                </ul>
              </li>
            </ul>
          </div>

          {/* Icônes à droite */}
          <div className="d-flex align-items-center">
            {/* Champ de recherche */}
            <Input />

          {/* Icône Panier */}
          <button className="btn btn-light me-2" onClick={() => navigate('/panier')}>
            <img src={shoppingIcon} alt="Shopping" className="img-fluid" width="20" />
          </button>

             
      
              <button className="btn btn-light" onClick={toggleModal}>
                <img src={userIcon} alt="User" className="img-fluid" width="20" />
              </button>
            
          </div>
        </div>
      </nav>

      {/* Modal Connexion */}
      {isModalOpen && <SignInForm toggleModal={toggleModal} />}
    </div>
  );
};

export default NavBar;
