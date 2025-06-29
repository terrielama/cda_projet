import React from 'react';
import NavBar from '../components/NavBar.jsx';  // Assure-toi que le chemin est correct
import Footer from '../components/Footer.jsx';  
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar /> 
      
      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};


export default MainLayout;
