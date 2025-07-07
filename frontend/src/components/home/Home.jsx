import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import LikeButton from '../product/LikeButton';  // <-- import ici

import "../../assets/css/styles.css";
import vansImage from "../../assets/img/img_page_accueil/vans.jpg";
import obeyImage from "../../assets/img/img_page_accueil/obey_pose.jpg";
import polarImage from "../../assets/img/img_page_accueil/polar.jpg";
import news1 from "../../assets/img/img_galerie/actu/news1.jpg";
import news2 from "../../assets/img/img_galerie/actu/news2.jpg";
import news3 from "../../assets/img/img_galerie/actu/news3.jpeg";

const api = axios.create({
  baseURL: "http://127.0.0.1:8001/",
});

const categoryMap = {
  accessoires: "ceintures",
  nouvellesboards: "Boards",
  nouvellesroues: "Roues",
};

const Home = () => {
  const [accessoires, setAccessoires] = useState([]);
  const [boards, setBoards] = useState([]);
  const [roues, setRoues] = useState([]);

  const [favorites, setFavorites] = useState({});
  const [likeMessage, setLikeMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("favorites");
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const saveFavoritesToStorage = (fav) => {
    localStorage.setItem("favorites", JSON.stringify(fav));
  };

  const toggleFavorite = (productId) => {
    const updatedFavorites = {
      ...favorites,
      [productId]: !favorites[productId],
    };
    setFavorites(updatedFavorites);
    saveFavoritesToStorage(updatedFavorites);

    setLikeMessage(
      updatedFavorites[productId]
        ? `Vous avez aimé le produit ${productId} !`
        : `Vous avez retiré le like du produit ${productId}.`
    );

    setTimeout(() => setLikeMessage(""), 2000);
  };

  useEffect(() => {
    const fetchProducts = async (backendCategory, setter) => {
      try {
        const response = await api.get(`products/${backendCategory}/`);
        setter(response.data.slice(0, 4));
      } catch (error) {
        console.error(`Erreur chargement ${backendCategory}`, error);
        setter([]);
      }
    };

    fetchProducts(categoryMap.accessoires, setAccessoires);
    fetchProducts(categoryMap.nouvellesboards, setBoards);
    fetchProducts(categoryMap.nouvellesroues, setRoues);
  }, []);

  const ProductCard = ({ product }) => (
    <Link to={`/produit/${product.id}`} className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />
      <h4 className="product-name">{product.name}</h4>
      <LikeButton
        productId={product.id}
        isLiked={favorites[product.id] || false}
        toggleFavorite={toggleFavorite}
      />
    </Link>
  );

  return (
    <>
      <div className="brands-container">
        <div className="main-image">
          <img src={vansImage} alt="Vans" />
          <Link to="/produit/chaussures" className="vans">
            <button>Voir Les Chaussures</button>
          </Link>
        </div>

        <div className="side-images">
          <Link to="/produit/13" className="side-item">
            <img src={obeyImage} alt="Obey" />
            <div className="side-text">OBEY</div>
          </Link>
          <Link to="/produit/16" className="side-item">
            <img src={polarImage} alt="Polar" />
            <div className="side-text">POLAR</div>
          </Link>
        </div>
      </div>

      {likeMessage && <div className="like-message">{likeMessage}</div>}

      <section className="category-section">
        <h2>NOUVEAUX ACCESSOIRES</h2>
        <div className="products-grid">
          {accessoires.length > 0 ? (
            accessoires.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p>Aucun accessoire disponible.</p>
          )}
        </div>
      </section>

      <section className="category-section">
        <h2>NOUVELLES BOARDS DE SKATE</h2>
        <div className="products-grid">
          {boards.length > 0 ? (
            boards.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p>Aucune board disponible.</p>
          )}
        </div>
      </section>

      <section className="category-section">
        <h2>NOUVELLES ROUES DE SKATE</h2>
        <div className="products-grid">
          {roues.length > 0 ? (
            roues.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p>Aucune roue disponible.</p>
          )}
        </div>
      </section>

      <section className="news-section">
        <h2>Actualités</h2>
        <div className="news-cards">
          <article className="news-card">
            <img src={news1} alt="Actualité 1" className="news1" />
            <div className="news-content">
              <h3>Paul Ro en hommage à lui même
              Paul Rodriguez </h3>
              <p>Paul Rodriguez fête ses 20 ans de carrière en tant que skateur professionel. L’occasion pour lui de poser en vidéo la légende qu’il est tout simplement.
              <hr></hr>
              <a href="https://skate.fr/mag/paul-rodriguez/" className="learn-more-link">En savoir plus...</a></p>

            </div>
          </article>
          <article className="news-card">
            <img src={news2} alt="Actualité 2" className="news2" />
            <div className="news-content">
              <h3>Aurélien Giraud - Le champion fait son entrée au Musée Grévin</h3>
              <p>
              « Incroyable », ce fut le mot de la semaine pour Aurélien Giraud. Premier Français à remporter une édition de la Street League.
              <hr></hr>
              <a href="https://skate.fr/mag/aurelien-giraud-musee-grevin/" className="learn-more-link">En savoir plus...</a></p>
            </div>
          </article>
          <article className="news-card">
            <img src={news3} alt="Actualité 3" className="news3" />
            <div className="news-content">
              <h3>Nassim Lacchab, Bronson avec nous
              Dealers choice Q&A serie</h3>
              <p>Nassim Lachaab from Morocco se livre avec enthousiasme au High-Speed Q&A par d’autres membres de la Team Bronson.
              <hr></hr>
              <a href="https://skate.fr/mag/nassim-lacchab-bronson-avec-nous/" className="learn-more-link">En savoir plus...</a></p>

            </div>
          </article>
        </div>
      </section>
    </>
  );
};

export default Home;
