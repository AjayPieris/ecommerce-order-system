import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppAuthProvider, useAppAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Pages
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import OrderStatus from "./pages/OrderStatus";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminInventory from "./pages/admin/Inventory";
import AdminOrders from "./pages/admin/Orders";
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

const AppContent = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/cart" element={
          <ProtectedRoute><Cart /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute><OrderStatus /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/inventory" element={
          <ProtectedRoute requiredRole="admin"><AdminInventory /></ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute requiredRole="admin"><AdminOrders /></ProtectedRoute>
        } />
      </Routes>
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