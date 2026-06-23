import { useNavigate } from "react-router-dom";
import { Star, Heart, ShoppingCart } from "lucide-react";

export default function ProductCard({ product, addToCart, isAuthenticated, userRole, signIn, isFlashSale }) {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col"
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

      <div className="px-2 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{product.name}</h3>
        
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center text-orange-400 text-xs font-bold">
            <Star size={12} fill="currentColor" className="mr-1" />
            4.9
          </div>
          <span className="text-gray-300 text-xs">•</span>
          <span className="text-gray-500 text-xs">100+ Sold</span>
        </div>

        <div className="flex items-end gap-2 mb-4 flex-grow">
          <span className="text-lg font-black text-gray-900">LKR {product.price}</span>
          {product.actual_price && (
            <span className="text-xs text-gray-400 line-through mb-1">LKR {product.actual_price}</span>
          )}
        </div>

        {isAuthenticated && userRole === "customer" ? (
          <div className="flex gap-2 mt-auto">
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                addToCart(product);
                navigate("/cart");
              }}
              disabled={product.stock_quantity === 0}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {product.stock_quantity === 0 ? "Out of Stock" : "Order Now"}
            </button>
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                addToCart(product); 
              }}
              disabled={product.stock_quantity === 0}
              className="w-[44px] shrink-0 rounded-xl bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border border-gray-200"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); signIn(); }}
            className="w-full py-2.5 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors mt-auto"
          >
            Sign in to buy
          </button>
        )}
      </div>
    </div>
  );
}
