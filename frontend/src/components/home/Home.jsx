import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import LikeButton from '../product/LikeButton';  // <-- import ici

import "../../assets/css/styles.css";
import vansImage from "../../assets/img/img_page_accueil/vans.jpg";
import obeyImage from "../../assets/img/img_page_accueil/obey_pose.jpg";
import polarImage from "../../assets/img/img_page_accueil/polar.jpg";

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
            <img src="https://via.placeholder.com/400x250" alt="Actualité 1" />
            <div className="news-content">
              <h3>Actualité 1</h3>
              <p>Découvrez les dernières nouveautés et tendances de la saison dans notre boutique.</p>
            </div>
          </article>
          <article className="news-card">
            <img src="https://via.placeholder.com/400x250" alt="Actualité 2" />
            <div className="news-content">
              <h3>Actualité 2</h3>
              <p>Profitez de nos offres spéciales exclusives sur une sélection de produits.</p>
            </div>
          </article>
          <article className="news-card">
            <img src="https://via.placeholder.com/400x250" alt="Actualité 3" />
            <div className="news-content">
              <h3>Actualité 3</h3>
              <p>Participez à notre concours et gagnez des cadeaux incroyables chaque mois.</p>
            </div>
          </article>
        </div>
      </section>
    </>
  );
};

export default Home;
