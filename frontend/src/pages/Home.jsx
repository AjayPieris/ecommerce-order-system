import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { productAPI } from "../services/api";
import { ShoppingCart, Star, Heart, Clock, ChevronRight, ChevronLeft, LayoutGrid, Monitor, Footprints, Utensils, ShoppingBag } from "lucide-react";

export default function Home() {
  const { isAuthenticated, userRole, signIn } = useAppAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getAll();
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'electronics': return <Monitor size={24} />;
      case 'footwear': return <Footprints size={24} />;
      case 'kitchen': return <Utensils size={24} />;
      case 'bags': return <ShoppingBag size={24} />;
      default: return <LayoutGrid size={24} />;
    }
  };

  const categories = ["All", "Electronics", "Footwear", "Kitchen", "Bags"];

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="bg-gray-50/30 min-h-screen pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl p-10 mb-12 flex items-center justify-between overflow-hidden relative">
          <div className="z-10 max-w-xl">
            <p className="text-gray-500 font-medium mb-2">#Mega Super Sale</p>
            <h1 className="text-5xl font-black text-gray-900 mb-4 leading-tight">
              Limited Time Offer!<br />Up to <span className="italic text-gray-800">50% OFF!</span>
            </h1>
            <p className="text-gray-600 text-lg mb-8">Upgrade Your Tech, Style & Home</p>
            {!isAuthenticated && (
              <button
                onClick={() => signIn()}
                className="bg-gray-900 text-white font-semibold px-8 py-3 rounded-full hover:bg-gray-800 transition"
              >
                Sign In to Shop
              </button>
            )}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 flex items-center justify-end overflow-hidden opacity-90">
            <img src="/hero_banner.png" alt="Fashion Sale" className="h-full w-full object-cover object-left mix-blend-multiply opacity-90 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100/90 via-gray-100/30 to-transparent md:bg-gradient-to-r md:from-gray-100 md:via-transparent md:to-transparent"></div>
          </div>
        </div>

        <div className="flex justify-center gap-6 sm:gap-10 mb-16 overflow-x-auto pb-4 no-scrollbar">
          {categories.map(cat => (
            <div 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              className="flex flex-col items-center gap-3 cursor-pointer group min-w-[80px]"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                selectedCategory === cat 
                  ? "bg-gray-900 text-white shadow-lg" 
                  : "bg-white text-gray-600 shadow-sm border border-gray-100 group-hover:bg-gray-50"
              }`}>
                {getCategoryIcon(cat)}
              </div>
              <span className={`text-sm font-semibold transition-colors ${
                selectedCategory === cat ? "text-gray-900" : "text-gray-500 group-hover:text-gray-900"
              }`}>
                {cat}
              </span>
            </div>
          ))}
        </div>

        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Todays For You!</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {['Best Seller', 'Keep Stylish', 'Special Discount', 'Official Store'].map(pill => (
                <button key={pill} className="px-4 py-2 border border-gray-200 rounded-full text-sm font-semibold text-gray-600 whitespace-nowrap hover:bg-gray-50">
                  {pill}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} isAuthenticated={isAuthenticated} userRole={userRole} signIn={signIn} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, addToCart, isAuthenticated, userRole, signIn, isFlashSale }) {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-2xl p-3 border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
    >
      <div className="relative bg-gray-100 rounded-xl aspect-square overflow-hidden mb-4">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />
        <button className="absolute top-3 right-3 p-1.5 bg-white rounded-full text-gray-300 hover:text-red-500 transition-colors shadow-sm">
          <Heart size={16} fill="currentColor" />
        </button>
      </div>

      <div className="px-1">
        <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">{product.name}</h3>
        
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center text-orange-400 text-xs font-bold">
            <Star size={12} fill="currentColor" className="mr-1" />
            4.9
          </div>
          <span className="text-gray-300 text-xs">•</span>
          <span className="text-gray-500 text-xs">100+ Sold</span>
        </div>

        <div className="flex items-end gap-2 mb-4">
          <span className="text-lg font-black text-gray-900">${product.price}</span>
          {isFlashSale && <span className="text-xs text-gray-400 line-through mb-1">${(product.price * 1.5).toFixed(2)}</span>}
        </div>

        {isAuthenticated && userRole === "customer" ? (
          <button
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            disabled={product.stock_quantity === 0}
            className="w-full py-2.5 rounded-xl font-bold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart size={16} />
            {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); signIn(); }}
            className="w-full py-2.5 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Sign in to buy
          </button>
        )}
      </div>
    </div>
  );
}