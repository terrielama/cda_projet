import React from 'react';
import LogoFooter from './LogoFooter';
const Footer = () => {
  return (
    <>
      <footer className="footer">
        <div className="footer-column">
          <h3>SERVICE CLIENT</h3>
          <ul>
          <li><a href="/contact">Assistance</a></li>
            <li>Suivi commande</li>
            <li>Livraison & retours</li>
          </ul>
          <LogoFooter />
        </div>
        <div className="footer-column">
          <h3>À PROPOS DE NOUS</h3>
          <ul>
            <li>Confidentialité</li>
            <li>Paiement sécurisé</li>
            <li>Gérer les cookies</li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>INFORMATIONS LEGALES</h3>
          <ul>
          <li><a href="/cgv">Conditions générales</a></li>
            <li>Mentions légales</li>
            <li>Gérer les cookies</li>
          </ul>
        </div>
      

      {/* Barre du dessous */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <span className="left">© 2025</span>
          <span className="right">
            Les coordonnées | Confidentialité et cookies
          </span>
        </div>
      </div>
      </footer>
    </>
  );
};

export default Footer;
