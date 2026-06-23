import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAppAuth } from "../context/AuthContext";
import { orderAPI } from "../services/api";
import { Trash2, Plus, Minus, ShoppingBag, CheckCircle, PartyPopper } from "lucide-react";
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">Order Placed! <PartyPopper className="text-yellow-500" size={28} /></h2>
          <p className="text-gray-500 mb-4">Your order has been confirmed and is being processed.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Order ID</span>
              <span className="font-semibold">#{orderSuccess.id}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-gray-900">${orderSuccess.total_amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="font-semibold text-green-500">{orderSuccess.status}</span>
            </div>
          </div>
          <Link
            to="/orders"
            className="block bg-gray-900 text-white py-3 rounded-full font-bold hover:bg-gray-800 transition shadow-md"
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
          className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition shadow-md inline-block"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/30 min-h-screen pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 shadow-sm hover:shadow-md transition">
                <div className="bg-gray-50 rounded-xl w-24 h-24 flex-shrink-0 flex items-center justify-center p-2">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover mix-blend-multiply rounded-lg"
                  />
                </div>
              <div className="flex-1 py-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-gray-900 font-black mt-1">${item.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition text-gray-600"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition text-gray-600"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-auto p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-right py-1">
                <p className="font-black text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

          {/* Order Summary */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-200/20 h-fit sticky top-24">
            <h2 className="text-xl font-black text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                  <span className="truncate pr-4">{item.name} <span className="font-bold text-gray-900 text-xs ml-1">x{item.quantity}</span></span>
                  <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between font-black text-lg text-gray-900">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Shipping Address</label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter complete shipping address..."
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 resize-none transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 font-medium border border-red-100">
                {error}
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3.5 rounded-full font-bold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-gray-900/20 flex items-center justify-center gap-2"
            >
              {loading ? "Processing..." : "Secure Checkout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}