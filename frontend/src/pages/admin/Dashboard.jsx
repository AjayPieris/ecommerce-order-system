import { useEffect, useState } from "react";
import { useAppAuth } from "../../context/AuthContext";
import { productAPI, orderAPI, customerAPI, notificationAPI } from "../../services/api";
import { Package, ShoppingBag, Users, Bell, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { getAuthHeader } = useAppAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const headers = await getAuthHeader();

      const [productsRes, ordersRes, customersRes, notifRes] = await Promise.all([
        productAPI.getAll(),
        orderAPI.getAll(headers),
        customerAPI.getAll(headers),
        notificationAPI.getAll(headers),
      ]);

      const products = productsRes.data;
      const orders = ordersRes.data;
      const customers = customersRes.data;
      const notifs = notifRes.data;

      const totalRevenue = orders
        .filter(o => o.status !== "CANCELLED")
        .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

      const pendingOrders = orders.filter(
        o => o.status === "PENDING" || o.status === "PROCESSING"
      ).length;

      const lowStockProducts = products.filter(
        p => p.stock_quantity < 10
      ).length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        totalRevenue: totalRevenue.toFixed(2),
        pendingOrders,
        lowStockProducts,
      });

      setRecentOrders(orders.slice(0, 5));
      setNotifications(notifs.slice(0, 5));

    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-700",
      PAYMENT_CONFIRMED: "bg-blue-100 text-blue-700",
      PROCESSING: "bg-orange-100 text-orange-700",
      SHIPPED: "bg-purple-100 text-purple-700",
      DELIVERED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard 👑</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Products", value: stats.totalProducts, icon: <Package size={20} />, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Orders", value: stats.totalOrders, icon: <ShoppingBag size={20} />, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Customers", value: stats.totalCustomers, icon: <Users size={20} />, color: "text-purple-500", bg: "bg-purple-50" },
          { label: "Revenue", value: `$${stats.totalRevenue}`, icon: <TrendingUp size={20} />, color: "text-green-500", bg: "bg-green-50" },
          { label: "Pending", value: stats.pendingOrders, icon: <Clock size={20} />, color: "text-yellow-500", bg: "bg-yellow-50" },
          { label: "Low Stock", value: stats.lowStockProducts, icon: <Bell size={20} />, color: "text-red-500", bg: "bg-red-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
            <Link to="/admin/orders" className="text-orange-500 text-sm hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No orders yet</p>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-700">Order #{order.id}</p>
                    <p className="text-xs text-gray-400">Customer #{order.customer_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-500">${order.total_amount}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(order.status)}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Notifications</h2>
            <Bell size={18} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No notifications yet</p>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-orange-500">
                      Order #{notif.order_id}
                    </span>
                    <span className="text-xs text-gray-400">
                      {notif.sent_at?.slice(0, 10)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Manage Inventory", to: "/admin/inventory", color: "bg-blue-500" },
          { label: "Manage Orders", to: "/admin/orders", color: "bg-orange-500" },
          { label: "View Products", to: "/", color: "bg-purple-500" },
          { label: "Notifications", to: "/admin/orders", color: "bg-green-500" },
        ].map((action, i) => (
          <Link
            key={i}
            to={action.to}
            className={`${action.color} text-white rounded-2xl p-4 text-center font-semibold hover:opacity-90 transition shadow-sm`}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}