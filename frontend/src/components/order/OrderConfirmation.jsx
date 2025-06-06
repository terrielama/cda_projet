import React from 'react';
import { Link, useParams } from 'react-router-dom';

const OrderConfirmation = () => {
  // Récupérer orderId depuis params ou props (exemple ici params)
  const { orderId } = useParams();

  return (
    <div>
      <h1>Merci pour votre commande !</h1>
      <p>Votre commande #{orderId} a bien été enregistrée.</p>

      {/* Lien vers le suivi de commande */}
      <Link to={`/orderTracking/${orderId}`}>
        Suivre ma commande
      </Link>
    </div>
  );
};

export default OrderConfirmation;
