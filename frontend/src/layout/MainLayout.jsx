import React from 'react';
import NavBar from '../components/NavBar.jsx';  // Assure-toi que le chemin est correct
import Footer from '../components/Footer.jsx';  
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />  {/* Assure-toi que NavBar.jsx est bien dans le bon dossier */}
      
      <main className="flex-grow">
        <Outlet /> {/* Affiche le contenu dynamique des pages */}
      </main>

      {/* Uncomment Footer if you need it */}
      {/* <Footer /> */}
      <Footer/>
    </div>
  );
};

export default MainLayout;
