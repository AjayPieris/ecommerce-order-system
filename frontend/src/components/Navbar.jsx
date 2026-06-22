import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Package, Search, ChevronDown, Bell, User, Smartphone } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, userRole, signIn, signUp, signOut, user } = useAppAuth();
  const { totalItems } = useCart();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top thin bar */}
      <div className="bg-gray-50 border-b border-gray-100 hidden md:block">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-8 text-[11px] text-gray-500 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 hover:text-gray-800 cursor-pointer"><Smartphone size={12}/> Download ShopEase App</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-gray-800 cursor-pointer">Mitra ShopEase</span>
            <span className="hover:text-gray-800 cursor-pointer">About ShopEase</span>
            <span className="hover:text-gray-800 cursor-pointer">ShopEase Care</span>
            <span className="hover:text-gray-800 cursor-pointer">Promo</span>
            <div className="w-px h-3 bg-gray-300 mx-1"></div>
            {!isAuthenticated ? (
              <>
                <button onClick={() => signUp()} className="hover:text-gray-800">Sign Up</button>
                <button onClick={() => signIn()} className="hover:text-gray-800">Login</button>
              </>
            ) : (
              <button onClick={() => signOut()} className="hover:text-gray-800 text-red-500">Log Out</button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 md:gap-8">
        <Link to="/" className="flex items-center gap-2">
          <Package size={28} className="text-gray-900" />
          <span className="text-2xl font-black tracking-tight text-gray-900 hidden sm:block">ShopEase</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-3xl flex items-center">
          <div className="flex w-full border border-gray-300 rounded-full overflow-hidden focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition">
            <div className="hidden md:flex items-center gap-1 bg-gray-50 px-4 py-2 border-r border-gray-300 text-sm text-gray-600 cursor-pointer hover:bg-gray-100">
              All Category <ChevronDown size={14} />
            </div>
            <div className="flex-1 flex items-center bg-white px-3">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products or brands here..." 
                className="w-full px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/cart" className="relative text-gray-600 hover:text-gray-900 transition">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <div className="text-gray-600 hover:text-gray-900 transition cursor-pointer hidden sm:block">
            <Bell size={24} />
          </div>
          
          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 pl-4 border-l border-gray-200 focus:outline-none"
              >
                <div className="flex flex-col items-end hidden md:flex">
                  <span className="text-xs font-bold text-gray-900">Hello, {user?.name || (userRole === "admin" ? "Admin" : "Customer")}</span>
                  <span className="text-[10px] text-gray-500">My Account</span>
                </div>
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition">
                  <User size={16} />
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-50 mb-2">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{user?.email || (userRole === "admin" ? "admin@test.com" : "customer@test.com")}</p>
                  </div>
                  
                  {userRole === "admin" && (
                    <Link 
                      to="/admin" 
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium transition"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <Link 
                    to="/orders" 
                    onClick={() => setShowProfileMenu(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium transition"
                  >
                    My Orders
                  </Link>
                  
                  <div className="h-px bg-gray-50 my-2"></div>
                  
                  <button 
                    onClick={() => { setShowProfileMenu(false); signOut(); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer" onClick={() => signIn()}>
              <User size={16} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}