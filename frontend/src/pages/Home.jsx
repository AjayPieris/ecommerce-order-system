import { useEffect, useState } from "react";
import { useAppAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { productAPI } from "../services/api";
import { ShoppingCart, Star, Package } from "lucide-react";

export default function Home() {
  const { isAuthenticated, userRole, signIn } = useAppAuth();
  const { addToCart, cartItems } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [addedMap, setAddedMap] = useState({});

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

  const categories = ["All", ...new Set(products.map(p => p.category))];

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter(p => p.category === selectedCategory);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedMap(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedMap(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome to ShopEase 🛍️</h1>
        <p className="text-orange-100 text-lg">Discover amazing products at great prices</p>
        {!isAuthenticated && (
          <button
            onClick={() => signIn()}
            className="mt-4 bg-white text-orange-500 font-semibold px-6 py-2 rounded-lg hover:bg-orange-50 transition"
          >
            Sign In to Shop →
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
              selectedCategory === cat
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-orange-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">

            {/* Product Image */}
            <div className="relative overflow-hidden h-48 bg-gray-50">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  Only {product.stock_quantity} left!
                </span>
              )}
              {product.stock_quantity === 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-full">
                {product.category}
              </span>
              <h3 className="font-semibold text-gray-800 mt-2 mb-1">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-800">
                  ${product.price}
                </span>
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <Package size={14} />
                  {product.stock_quantity} in stock
                </div>
              </div>

              {/* Add to Cart Button */}
              {isAuthenticated && userRole === "customer" ? (
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock_quantity === 0}
                  className={`w-full mt-3 py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition ${
                    addedMap[product.id]
                      ? "bg-green-500 text-white"
                      : product.stock_quantity === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                >
                  <ShoppingCart size={16} />
                  {addedMap[product.id] ? "Added! ✓" : "Add to Cart"}
                </button>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="w-full mt-3 py-2 rounded-xl font-medium bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition"
                >
                  Sign in to buy
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}