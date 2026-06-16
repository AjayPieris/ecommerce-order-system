import { Link } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";
import { ShoppingCart, Package, LayoutDashboard, LogIn, LogOut } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, userRole, signIn, signOut, user } = useAppAuth();

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold text-orange-500">
        🛒 ShopEase
      </Link>

      {/* Links */}
      <div className="flex items-center gap-6">
        <Link to="/" className="text-gray-600 hover:text-orange-500 font-medium">
          Products
        </Link>

        {isAuthenticated && userRole === "customer" && (
          <>
            <Link to="/cart" className="flex items-center gap-1 text-gray-600 hover:text-orange-500 font-medium">
              <ShoppingCart size={18} /> Cart
            </Link>
            <Link to="/orders" className="flex items-center gap-1 text-gray-600 hover:text-orange-500 font-medium">
              <Package size={18} /> My Orders
            </Link>
          </>
        )}

        {isAuthenticated && userRole === "admin" && (
          <>
            <Link to="/admin" className="flex items-center gap-1 text-gray-600 hover:text-orange-500 font-medium">
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link to="/admin/inventory" className="text-gray-600 hover:text-orange-500 font-medium">
              Inventory
            </Link>
            <Link to="/admin/orders" className="text-gray-600 hover:text-orange-500 font-medium">
              Orders
            </Link>
          </>
        )}
      </div>

      {/* Auth Button */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {userRole === "admin" ? "👑 Admin" : "👤 Customer"}
            </span>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn()}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            <LogIn size={16} /> Sign In
          </button>
        )}
      </div>
    </nav>
  );
}