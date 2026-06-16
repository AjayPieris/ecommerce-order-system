import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAppAuth } from "../context/AuthContext";
import { orderAPI } from "../services/api";
import { Trash2, Plus, Minus, ShoppingBag, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { customerId, getAuthHeader } = useAppAuth();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState("");

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      setError("Please enter your shipping address!");
      return;
    }
    if (cartItems.length === 0) {
      setError("Your cart is empty!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = await getAuthHeader();
      const orderData = {
        customer_id: customerId || 1,
        shipping_address: address,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price
        }))
      };

      const res = await orderAPI.create(orderData, headers);
      setOrderSuccess(res.data);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Order Success Screen
  if (orderSuccess) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed! 🎉</h2>
          <p className="text-gray-500 mb-4">Your order has been confirmed and is being processed.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Order ID</span>
              <span className="font-semibold">#{orderSuccess.id}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Total</span>
              <span className="font-semibold text-orange-500">${orderSuccess.total_amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="font-semibold text-green-500">{orderSuccess.status}</span>
            </div>
          </div>
          <Link
            to="/orders"
            className="block bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
          >
            Track My Order →
          </Link>
        </div>
      </div>
    );
  }

  // Empty Cart
  if (cartItems.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Add some products to get started!</p>
        <Link
          to="/"
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Cart 🛒</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 shadow-sm">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-xl"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-orange-500 font-bold">${item.price}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded-lg bg-gray-100 hover:bg-orange-100 transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-semibold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded-lg bg-gray-100 hover:bg-orange-100 transition"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-auto p-1 text-red-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>

          <div className="space-y-2 mb-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between text-sm text-gray-500">
                <span>{item.name} x{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 mb-4">
            <div className="flex justify-between font-bold text-gray-800">
              <span>Total</span>
              <span className="text-orange-500">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <textarea
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Enter shipping address..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-3 focus:outline-none focus:border-orange-400 resize-none"
          />

          {error && (
            <p className="text-red-500 text-sm mb-3">{error}</p>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? "Placing Order..." : "Place Order →"}
          </button>
        </div>
      </div>
    </div>
  );
}