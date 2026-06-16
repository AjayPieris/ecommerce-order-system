
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "@asgardeo/auth-react";
import { AppAuthProvider, useAppAuth } from "./context/AuthContext";

// Pages
// import Home from "./pages/Home";
// import Cart from "./pages/Cart";
// import OrderStatus from "./pages/OrderStatus";
// import AdminDashboard from "./pages/admin/Dashboard";
// import AdminInventory from "./pages/admin/Inventory";
// import AdminOrders from "./pages/admin/Orders";
import Navbar from "./components/Navbar";
import Callback from "./pages/Callback.jsx";

// Dummy components to prevent ReferenceError
const Home = () => <div>Home Page</div>;
const Cart = () => <div>Cart Page</div>;
const OrderStatus = () => <div>Order Status Page</div>;
const AdminDashboard = () => <div>Admin Dashboard</div>;
const AdminInventory = () => <div>Admin Inventory</div>;
const AdminOrders = () => <div>Admin Orders</div>;


// Protected Route
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
  const { isAuthenticated, isLoading } = useAppAuth();

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/callback" element={<Callback />} />

        {/* Customer Routes */}
        <Route path="/cart" element={
          <ProtectedRoute><Cart /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute><OrderStatus /></ProtectedRoute>
        } />

        {/* Admin Routes */}
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
      <AppContent />
    </AppAuthProvider>
  );
}