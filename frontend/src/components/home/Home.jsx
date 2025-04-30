import React from 'react';
import   "../../assets/css/styles.css";
import vansImage from "../../assets/img/img_page_accueil/vans.jpg";
import obeyImage from "../../assets/img/img_page_accueil/obey_pose.jpg";
import polarImage from "../../assets/img/img_page_accueil/polar.jpg";

const Home = () => {
  return (
    <div className="brands-container">
      <div className="main-image">
        <img src={vansImage} alt="Vans" />
          <button className="vans">Voir Les Chaussures</button>
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
  );
};

export default Home;