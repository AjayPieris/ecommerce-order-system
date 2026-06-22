import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppAuthProvider, useAppAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Pages
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import OrderStatus from "./pages/OrderStatus";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminInventory from "./pages/admin/Inventory";
import AdminOrders from "./pages/admin/Orders";
import AdminLayout from "./components/AdminLayout";
import Navbar from "./components/Navbar";
import Callback from "./pages/Callback";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, userRole } = useAppAuth();

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-xl font-semibold text-gray-600 animate-pulse">
        Loading...
      </div>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/" />;
  if (requiredRole && userRole !== requiredRole) return <Navigate to="/" />;
  return children;
};

import Footer from "./components/Footer";

const AppContent = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/cart" element={
              <ProtectedRoute><Cart /></ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute><OrderStatus /></ProtectedRoute>
            } />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <AppAuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AppAuthProvider>
  );
}