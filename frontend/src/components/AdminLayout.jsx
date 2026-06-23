import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Home } from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();

  const navLinks = [
    { label: "Dashboard", to: "/admin", icon: <LayoutDashboard size={20} /> },
    { label: "Inventory", to: "/admin/inventory", icon: <Package size={20} /> },
    { label: "Orders", to: "/admin/orders", icon: <ShoppingBag size={20} /> },
    { label: "View Store", to: "/", icon: <Home size={20} /> },
  ];

  return (
    <div className="bg-gray-50/30 min-h-screen pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-8">
              <h2 className="text-xl font-black text-gray-900 mb-6">Admin Menu</h2>
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                        isActive 
                          ? "bg-gray-900 text-white shadow-md shadow-gray-900/20" 
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
}
