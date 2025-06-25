import React from 'react';
import NavBar from '../components/NavBar.jsx';  // Assure-toi que le chemin est correct
import Footer from '../components/Footer.jsx';  
import { Outlet } from 'react-router-dom';
import '../assets/css/styles.css';

const MainLayout = () => {
  return (
    <div className="main ">
      <NavBar /> 
      
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};



export default MainLayout;
