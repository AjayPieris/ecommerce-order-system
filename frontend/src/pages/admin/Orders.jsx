import { useEffect, useState } from "react";
import { useAppAuth } from "../../context/AuthContext";
import { orderAPI, notificationAPI } from "../../services/api";
import { Package, Truck, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";

const ORDER_STATUSES = [
  "PENDING",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

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

export default function AdminOrders() {
  const { getAuthHeader } = useAppAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const headers = await getAuthHeader();
      const res = await orderAPI.getAll(headers);
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      const headers = await getAuthHeader();
      const res = await orderAPI.getById(orderId, headers);
      setSelectedOrder(res.data);
    } catch (error) {
      console.error("Error fetching order detail:", error);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const headers = await getAuthHeader();
      await orderAPI.updateStatus(orderId, newStatus, headers);

      // Send notification
      await notificationAPI.sendStatusNotif({
        order_id: orderId,
        customer_email: "customer@test.com",
        status: newStatus,
        total_amount: orders.find(o => o.id === orderId)?.total_amount || 0,
      }, headers);

      await fetchOrders();

      // Update selected order if open
      if (selectedOrder?.id === orderId) {
        await fetchOrderDetail(orderId);
      }
    } catch (error) {
      console.error("Status update error:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = filterStatus === "ALL"
    ? orders
    : orders.filter(o => o.status === filterStatus);

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Management 🛒</h1>
          <p className="text-gray-400 text-sm">{orders.length} total orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition"
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["ALL", ...ORDER_STATUSES].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filterStatus === status
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-orange-50"
            }`}
          >
            {status.replace(/_/g, " ")}
            {status !== "ALL" && (
              <span className="ml-1 text-xs">
                ({orders.filter(o => o.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Order</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Customer</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Total</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Date</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Update Status</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-semibold text-gray-800">#{order.id}</td>
                  <td className="p-4 text-gray-600">Customer #{order.customer_id}</td>
                  <td className="p-4 font-bold text-orange-500">${order.total_amount}</td>
                  <td className="p-4 text-gray-400 text-sm">{order.created_at?.slice(0, 10)}</td>
                  <td className="p-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(order.status)}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={e => handleStatusUpdate(order.id, e.target.value)}
                      disabled={updatingId === order.id || order.status === "DELIVERED" || order.status === "CANCELLED"}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {ORDER_STATUSES.map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                    {updatingId === order.id && (
                      <span className="ml-2 text-xs text-orange-500 animate-pulse">Updating...</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => fetchOrderDetail(order.id)}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Order #{selectedOrder.id}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >×</button>
            </div>

            {/* Order Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
              {[
                { label: "Status", value: selectedOrder.status.replace(/_/g, " "), highlight: true },
                { label: "Payment", value: selectedOrder.payment_status },
                { label: "Customer ID", value: `#${selectedOrder.customer_id}` },
                { label: "Date", value: selectedOrder.created_at?.slice(0, 10) },
                { label: "Ship to", value: selectedOrder.shipping_address },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{label}</span>
                  <span className={`font-medium ${highlight ? "text-orange-500" : "text-gray-700"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Order Items */}
            <h3 className="font-semibold text-gray-800 mb-3">Items Ordered</h3>
            <div className="space-y-2 mb-4">
              {selectedOrder.items?.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-700 text-sm">{item.product_name}</p>
                    <p className="text-xs text-gray-400">
                      ${item.unit_price} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-gray-800">${item.subtotal}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-orange-500">${selectedOrder.total_amount}</span>
            </div>

            {/* Quick Status Update in Modal */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Update Status
              </label>
              <div className="flex gap-2 flex-wrap">
                {ORDER_STATUSES.map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                    disabled={selectedOrder.status === status}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                      selectedOrder.status === status
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-500"
                    }`}
                  >
                    {status.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}