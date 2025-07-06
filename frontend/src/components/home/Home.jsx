import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

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
  // États pour chaque catégorie
  const [accessoires, setAccessoires] = useState([]);
  const [boards, setBoards] = useState([]);
  const [roues, setRoues] = useState([]);

  useEffect(() => {
    // Fonction générique pour récupérer 4 produits par catégorie
    const fetchProducts = async (backendCategory, setter) => {
      try {
        const response = await api.get(`products/${backendCategory}/`);
        setter(response.data.slice(0, 4)); // On garde 4 produits max
      } catch (error) {
        console.error(`Erreur chargement ${backendCategory}`, error);
        setter([]);
      }
    };

    fetchProducts(categoryMap.accessoires, setAccessoires);
    fetchProducts(categoryMap.nouvellesboards, setBoards);
    fetchProducts(categoryMap.nouvellesroues, setRoues);
  }, []);

  // Composant Card produit simple (card cliquable)
  const ProductCard = ({ product }) => (
    <Link to={`/produits/${product.id}`} className="product-card-link">
      <div className="product-card">
        <img src={product.image} alt={product.name} className="product-image" />
        <h4 className="product-name">{product.name}</h4>
        <p className="product-price">{product.price} €</p>
      </div>
    </Link>
  );

  // Données statiques pour les actualités (JSX dans content)
  const newsData = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      content: (
        <>
          <h3>Nouvelle collection printemps 2025</h3>
          <p>
            Découvrez notre nouvelle gamme de produits tendance pour le printemps
            2025, avec des designs exclusifs et des matériaux durables.
          </p>
        </>
      ),
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80",
      content: (
        <>
          <h3>Événement skatepark ce weekend</h3>
          <p>
            Rejoignez-nous au skatepark local pour un weekend de compétition,
            ateliers et musique live. Entrée gratuite pour tous !
          </p>
        </>
      ),
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=400&q=80",
      content: (
        <>
          <h3>Interview exclusive avec un pro skateur</h3>
          <p>
            Découvrez l’interview exclusive de notre champion local qui partage ses
            conseils et sa passion pour le skate.
          </p>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="brands-container">
        <div className="main-image">
          <img src={vansImage} alt="Vans" />
          <Link to="/produits/chaussures">
            <button className="vans">Voir Les Chaussures</button>
          </Link>
        </div>
        <div className="side-images">
          <div className="side-item">
            <img src={obeyImage} alt="Obey" />
            <div className="side-text">OBEY</div>
          </div>
          <div className="side-item">
            <img src={polarImage} alt="Polar" />
            <div className="side-text">POLAR</div>
          </div>
        </div>
      </div>

      {/* Section Accessoires */}
      <section className="category-section">
        <h2>Accessoires</h2>
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

      {/* Section Nouvelles Boards */}
      <section className="category-section">
        <h2>Nouvelles Boards</h2>
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

      {/* Section Nouvelles Roues */}
      <section className="category-section">
        <h2>Nouvelles Roues</h2>
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

      {/* Section Actualités */}
      <section className="category-section">
        <h2>Actualités</h2>
        <div className="products-grid">
          {newsData.map(({ id, image, content }) => (
            <div key={id} className="news-card">
              <img src={image} alt={`actualité ${id}`} className="news-image" />
              <div className="news-text">{content}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;
