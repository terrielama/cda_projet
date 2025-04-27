import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Order = () => {
  const { order_id } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await api.get(`http://localhost:8001/order_details/${order_id}`);
        setOrderDetails(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des détails de la commande", err);
      }
    };
    
    fetchOrderDetails();
  }, [order_id]);

  return (
    <div className="order-page">
      {orderDetails ? (
        <div>
          <h1>Commande #{orderDetails.id}</h1>
          {/* Affichez les détails de la commande ici */}
          <ul>
            {orderDetails.items.map((item) => (
              <li key={item.product.id}>
                {item.product.name} - {item.quantity} x {item.price} €
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Chargement de la commande...</p>
      )}
    </div>
  );
};

export default Order;
