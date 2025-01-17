import React, { useState, useEffect } from 'react';
import './CSS/OrderSummary.css';
import deleteicon from '../../assets/delete.png';

const OrderSummary = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  const fetchOrderDetails = async () => {
    try {
      const accessToken = localStorage.getItem("auth-token");
      const response = await fetch(`https://wayuapi.wayumart.com/cart/${userId}`, {
        headers: {
          'x-access-token': accessToken
        }
      });
      const data = await response.json();
      setOrder(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [userId]);

  const removeFromCart = async (productId, selectedSize) => {
    try {
      const accessToken = localStorage.getItem("auth-token");
      await fetch(`https://wayuapi.wayumart.com/removeFromCart/${userId}?productId=${productId}&selectedSize=${selectedSize}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken
        }
      });
      fetchOrderDetails(); // Refresh order details after deletion
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!order || !order.products) {
    return <p className='no-product-found'>No products found.</p>;
  }

  const aggregateProducts = () => {
    const aggregatedProducts = {};
    order.products.forEach(product => {
      const { productId, selected_size, price, quantity } = product;
      const key = `${productId}-${selected_size}`;
      if (aggregatedProducts[key]) {
        aggregatedProducts[key].quantity += quantity;
        aggregatedProducts[key].total += price * quantity;
      } else {
        aggregatedProducts[key] = {
          ...product,
          total: price * quantity
        };
      }
    });
    return Object.values(aggregatedProducts);
  };

  const aggregatedProducts = aggregateProducts();

  return (
    <div className="order-summary">
      <h2>Order summary</h2>
      <div className="order-summary-table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {aggregatedProducts.map(product => (
              <tr key={product._id}>
                <td className="product-info">
                  <img src={product.product_image} alt={product.name} />
                  <span>{product.name}</span>
                </td>
                <td>{product.selected_size}</td>
                <td>{product.quantity}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>${product.total.toFixed(2)}</td>
                <td>
                  <button className="delete-btn" onClick={() => removeFromCart(product.productId, product.selected_size)}>
                    <img src={deleteicon} alt="Delete" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" className="text-right"><strong>Total:</strong></td>
              <td>${order.bill.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default OrderSummary;
