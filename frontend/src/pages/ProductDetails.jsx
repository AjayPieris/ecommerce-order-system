import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { productAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { useAppAuth } from "../context/AuthContext";
import { ShoppingCart, ArrowLeft, Star, Heart, Share2, ShieldCheck, Truck } from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, userRole, signIn } = useAppAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productAPI.getById(id);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50/30">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50/30">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || "Product not found"}</h2>
        <Link to="/" className="px-6 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/30 min-h-screen pb-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-12 shadow-sm flex flex-col md:flex-row gap-12">
          
          {/* Image Section */}
          <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 rounded-2xl p-8 relative group">
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="max-w-full h-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            />
            <button className="absolute top-4 right-4 p-3 bg-white rounded-full text-gray-400 hover:text-red-500 hover:shadow-md transition-all">
              <Heart size={20} />
            </button>
          </div>

          {/* Details Section */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="mb-2">
              <span className="inline-block bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-orange-400 font-bold">
                <Star size={16} fill="currentColor" className="mr-1" />
                <Star size={16} fill="currentColor" className="mr-1" />
                <Star size={16} fill="currentColor" className="mr-1" />
                <Star size={16} fill="currentColor" className="mr-1" />
                <Star size={16} fill="currentColor" className="mr-1" />
                <span className="text-gray-600 ml-2">4.9 (128 reviews)</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600 font-medium">100+ Sold</span>
            </div>

            <div className="text-4xl font-black text-gray-900 mb-6">
              ${product.price}
            </div>

            <p className="text-gray-600 leading-relaxed mb-8 text-lg">
              {product.description}
            </p>

            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-3 text-gray-600 font-medium">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                1 Year Official Warranty
              </div>
              <div className="flex items-center gap-3 text-gray-600 font-medium">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <Truck size={20} />
                </div>
                Free Shipping Worldwide
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated && userRole === "customer" ? (
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock_quantity === 0}
                  className="flex-1 py-4 rounded-2xl font-bold text-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="flex-1 py-4 rounded-2xl font-bold text-lg bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors border border-gray-200"
                >
                  Sign in to buy
                </button>
              )}
              
              <button className="p-4 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                <Share2 size={24} />
              </button>
            </div>
            
            <p className="text-sm font-medium text-gray-400 mt-4 text-center md:text-left">
              {product.stock_quantity > 0 ? (
                <span className="text-green-600">{product.stock_quantity} items in stock</span>
              ) : (
                <span className="text-red-500">Currently out of stock</span>
              )}
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
