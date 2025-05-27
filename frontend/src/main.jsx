import React from 'react';  // Import de React pour JSX
import ReactDOM from 'react-dom/client';  // Utilisation de 'react-dom/client' dans React 18
import App from './App';
import './assets/css/styles.css';  


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
