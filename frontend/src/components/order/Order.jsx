import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Order = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8001/order/${orderId}`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement de la commande');
        }
        const data = await response.json();
        setOrderDetails(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  if (!orderDetails) {
    return <div>Aucune commande trouvée.</div>;
  }

  return (
    <div className="order-details">
      <h1>Détails de la commande</h1>

      {orderDetails.items && orderDetails.items.length > 0 ? (
        <div>
          {orderDetails.items.map((item, index) => (
            <div key={index} className="order-item">
              <h3>{item.product_name}</h3>
              <p>Quantité : {item.quantity}</p>
              <p>Prix unitaire : {item.product_price} €</p>
              <p>Total : {item.total_price} €</p>
              {item.product_image && (
                <img
                  src={`http://localhost:8001${item.product_image}`}
                  alt={item.product_name}
                  style={{ width: '100px', height: '100px' }}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>Aucun produit dans cette commande.</p>
      )}
    </div>
  );
};

export default Order;
