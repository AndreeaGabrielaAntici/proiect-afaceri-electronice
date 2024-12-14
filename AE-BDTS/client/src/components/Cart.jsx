import { useDispatch, useSelector } from "react-redux";
import {
  updateCart,
  removeFromCart,
  clearCart,
} from "../store/slices/cartSlice";
import { useState, useEffect } from "react";
import { createOrder } from "../routes/orders";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Load Stripe with your publishable key
const stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY
const stripePromise = loadStripe(stripeSecretKey); // Replace with your publishable key

const CheckoutForm = ({ formData, token, cartTotal, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async () => {
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    try {
      const total = Number(cartTotal());

      // Create order on the server
      const response = await createOrder({ ...formData, total }, token);
      console.log("Order creation response:", response);

      if (!response.success) {
        toast.error(response.message || "Failed to create order");
        return;
      }

      const { paymentIntentClientSecret } = response.data;

      // Confirm the card payment
      const cardElement = elements.getElement(CardElement);
      const { paymentIntent, error } = await stripe.confirmCardPayment(paymentIntentClientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.name,
            // You can add other billing details if you collected them
          },
        },
      });

      if (error) {
        console.error("Payment failed:", error);
        toast.error(error.message);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        onSuccess();
      }
    } catch (error) {
      console.error("Error during payment:", error);
      toast.error("An error occurred during payment.");
    }
  };

  return (
    <div>
      <CardElement className="bg-white p-2 border border-gray-300 rounded-md" />
      <button className="cart-button" onClick={handlePayment} disabled={!stripe}>
        Pay
      </button>
    </div>
  );
};

const Cart = () => {
  const { token } = useSelector((state) => state.global);
  const { cart } = useSelector((state) => state.cart);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuantityChange = (product, quantity) => {
    if (quantity > 0) {
      dispatch(updateCart({ id: product.id, quantity }));
    } else {
      dispatch(removeFromCart({ id: product.id }));
    }
  };

  const cartTotal = () => {
    return cart
      .reduce((total, product) => total + product.price * product.quantity, 0)
      .toFixed(2);
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleSuccess = () => {
    // On successful payment, clear the cart and redirect
    dispatch(clearCart());
    window.location.href = "/"; // Redirect to homepage
  };

  return (
    <Elements stripe={stripePromise}>
      <div>
        <div className="cart-container">
          <div className="w-1/4 flex flex-col justify-center">
            <label
              htmlFor="name-input"
              className="block mb-1 text-sm font-medium text-black"
            >
              Name
            </label>
            <input
              type="text"
              id="name-input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg block !w-full p-2.5"
            />

            <label
              htmlFor="phone-input"
              className="block mt-4 mb-1 text-sm font-medium text-black"
            >
              Phone
            </label>
            <input
              type="text"
              id="phone-input"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg block !w-full p-2.5"
            />

            <label
              htmlFor="address-input"
              className="block mt-4 mb-1 text-sm font-medium text-black"
            >
              Address
            </label>
            <input
              type="text"
              id="address-input"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg block !w-full p-2.5"
            />

            <label
              htmlFor="city-input"
              className="block mt-4 mb-1 text-sm font-medium text-black"
            >
              City
            </label>
            <input
              type="text"
              id="city-input"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg block !w-full p-2.5"
            />
          </div>

          <div className="cart-items max-h-[400px] overflow-auto">
            {cart.map((product) => (
              <div key={product.id} className="cart-item">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h3>{product.title}</h3>
                  <p>Price: ${product.price.toFixed(2)}</p>
                  <div className="cart-item-buttons">
                    <div>
                      <button
                        onClick={() =>
                          handleQuantityChange(product, product.quantity - 1)
                        }
                      >
                        -
                      </button>
                    </div>
                    <span>{product.quantity}</span>
                    <div>
                      <button
                        onClick={() =>
                          handleQuantityChange(product, product.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="cart-summary">
          <div className="cart-total">
            <h3>Total: ${cartTotal()}</h3>
          </div>
          <div className="cart-buttons" style={{ display: 'block' }}>
  <button className="cart-button" onClick={handleClearCart}>
    Clear Cart
  </button>
  <CheckoutForm formData={formData} token={token} cartTotal={cartTotal} onSuccess={handleSuccess} />
</div>

        </div>
      </div>
    </Elements>
  );
};

export default Cart;
