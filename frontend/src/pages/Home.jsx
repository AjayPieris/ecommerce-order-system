import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { productAPI } from "../services/api";
import ProductCard from "../components/ProductCard";
import { ShoppingCart, Star, Heart, Clock, ChevronRight, ChevronLeft, LayoutGrid, Monitor, Shirt, Book, Leaf, Gamepad2, Dumbbell, Package } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
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
      case 'clothing': return <Shirt size={24} />;
      case 'books': return <Book size={24} />;
      case 'home & garden': return <Leaf size={24} />;
      case 'toys': return <Gamepad2 size={24} />;
      case 'sports': return <Dumbbell size={24} />;
      case 'other': return <Package size={24} />;
      default: return <LayoutGrid size={24} />;
    }
  };

  const categories = ["All", "Electronics", "Clothing", "Books", "Home & Garden", "Toys", "Sports", "Other"];

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
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredProducts.slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} isAuthenticated={isAuthenticated} userRole={userRole} signIn={signIn} />
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <button 
              onClick={() => navigate("/products")}
              className="px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 flex items-center gap-2"
            >
              View All Products
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}