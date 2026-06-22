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
    PENDING: "bg-gray-100 text-gray-700",
    PAYMENT_CONFIRMED: "bg-gray-200 text-gray-800",
    PROCESSING: "bg-gray-900 text-white",
    SHIPPED: "bg-gray-800 text-white",
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
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="bg-gray-50/30 min-h-screen pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Order Management</h1>
            <p className="text-gray-500 mt-1">{orders.length} total orders</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition"
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {["ALL", ...ORDER_STATUSES].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filterStatus === status
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
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

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-500">Order</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-500">Customer</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-500">Total</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-500">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-500">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-500">Update Status</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-500">Details</th>
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
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">#{order.id}</td>
                    <td className="py-4 px-6 text-gray-600">Customer #{order.customer_id}</td>
                    <td className="py-4 px-6 font-black text-gray-900">${order.total_amount}</td>
                    <td className="py-4 px-6 text-gray-500">{order.created_at?.slice(0, 10)}</td>
                    <td className="py-4 px-6">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(order.status)}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={order.status}
                      onChange={e => handleStatusUpdate(order.id, e.target.value)}
                      disabled={updatingId === order.id || order.status === "DELIVERED" || order.status === "CANCELLED"}
                      className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {ORDER_STATUSES.map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                    {updatingId === order.id && (
                      <span className="ml-2 text-xs font-bold text-gray-900 animate-pulse">Updating...</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => fetchOrderDetail(order.id)}
                      className="text-sm font-bold text-gray-900 hover:underline"
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
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">Order #{selectedOrder.id}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 transition"
              >×</button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-3">
              {[
                { label: "Status", value: selectedOrder.status.replace(/_/g, " "), highlight: true },
                { label: "Payment", value: selectedOrder.payment_status },
                { label: "Customer ID", value: `#${selectedOrder.customer_id}` },
                { label: "Date", value: selectedOrder.created_at?.slice(0, 10) },
                { label: "Ship to", value: selectedOrder.shipping_address },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className={`font-bold ${highlight ? "text-gray-900" : "text-gray-700"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <h3 className="font-bold text-gray-900 mb-4">Items Ordered</h3>
            <div className="space-y-3 mb-6">
              {selectedOrder.items?.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{item.product_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ${item.unit_price} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-black text-gray-900">${item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6 flex justify-between font-black text-lg">
              <span>Total</span>
              <span className="text-gray-900">${selectedOrder.total_amount}</span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Update Status
              </label>
              <div className="flex gap-2 flex-wrap">
                {ORDER_STATUSES.map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                    disabled={selectedOrder.status === status}
                    className={`text-xs px-4 py-2 rounded-full font-bold transition ${
                      selectedOrder.status === status
                        ? "bg-gray-900 text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
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
    </div>
  );
}