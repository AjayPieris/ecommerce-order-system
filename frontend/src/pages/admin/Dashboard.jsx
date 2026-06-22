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
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="mb-2">
        <h1 className="text-3xl font-black text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { label: "Products", value: stats.totalProducts, icon: <Package size={20} />, color: "text-gray-900", bg: "bg-gray-100" },
              { label: "Orders", value: stats.totalOrders, icon: <ShoppingBag size={20} />, color: "text-gray-900", bg: "bg-gray-100" },
              { label: "Customers", value: stats.totalCustomers, icon: <Users size={20} />, color: "text-gray-900", bg: "bg-gray-100" },
              { label: "Revenue", value: `$${stats.totalRevenue}`, icon: <TrendingUp size={20} />, color: "text-gray-900", bg: "bg-gray-100" },
              { label: "Pending", value: stats.pendingOrders, icon: <Clock size={20} />, color: "text-yellow-600", bg: "bg-yellow-50" },
              { label: "Low Stock", value: stats.lowStockProducts, icon: <Bell size={20} />, color: "text-red-600", bg: "bg-red-50" },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition">
                <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
                  {stat.icon}
                </div>
                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                <p className="text-sm font-medium text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-gray-900 text-sm hover:underline font-semibold">
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No orders yet</p>
              ) : (
                recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition rounded-2xl border border-transparent hover:border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900">Order #{order.id}</p>
                      <p className="text-xs text-gray-500 mt-1">Customer #{order.customer_id}</p>
                    </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900 mb-1">${order.total_amount}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(order.status)}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Notifications</h2>
              <Bell size={20} className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No notifications yet</p>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className="p-4 bg-gray-50/50 hover:bg-gray-50 transition rounded-2xl border border-transparent hover:border-gray-100">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-gray-900 bg-gray-200 px-2 py-0.5 rounded">
                        Order #{notif.order_id}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {notif.sent_at?.slice(0, 10)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-600">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
            </div>
          </div>
        </div>
    </div>
  );
}