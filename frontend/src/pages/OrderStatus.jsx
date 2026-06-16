import { useEffect, useState } from "react";
import { useAppAuth } from "../context/AuthContext";
import { orderAPI } from "../services/api";
import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";

const STATUS_STEPS = ["PENDING", "PAYMENT_CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

const statusIcon = (status) => {
  const icons = {
    PENDING: <Clock className="text-yellow-500" size={20} />,
    PAYMENT_CONFIRMED: <CheckCircle className="text-blue-500" size={20} />,
    PROCESSING: <Package className="text-orange-500" size={20} />,
    SHIPPED: <Truck className="text-purple-500" size={20} />,
    DELIVERED: <CheckCircle className="text-green-500" size={20} />,
    CANCELLED: <XCircle className="text-red-500" size={20} />,
  };
  return icons[status] || <Clock size={20} />;
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

export default function OrderStatus() {
  const { customerId, getAuthHeader } = useAppAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (customerId) fetchOrders();
  }, [customerId]);

  const fetchOrders = async () => {
    try {
      const headers = await getAuthHeader();
      const res = await orderAPI.getByCustomer(customerId, headers);
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

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders 📦</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 text-lg">No orders yet!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => fetchOrderDetail(order.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">Order #{order.id}</h3>
                  <p className="text-sm text-gray-400">{order.created_at?.slice(0, 10)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-500 text-lg">${order.total_amount}</p>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(order.status)}`}>
                    {order.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              {order.status !== "CANCELLED" && (
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    {STATUS_STEPS.map((step, index) => {
                      const currentIndex = STATUS_STEPS.indexOf(order.status);
                      const isCompleted = index <= currentIndex;
                      return (
                        <div key={step} className="flex flex-col items-center flex-1">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            isCompleted
                              ? "bg-orange-500 border-orange-500"
                              : "bg-white border-gray-300"
                          }`} />
                          {index < STATUS_STEPS.length - 1 && (
                            <div className={`h-1 w-full mt-1.5 ${
                              index < currentIndex ? "bg-orange-500" : "bg-gray-200"
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Pending</span>
                    <span>Paid</span>
                    <span>Processing</span>
                    <span>Shipped</span>
                    <span>Delivered</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Order #{selectedOrder.id}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >×</button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="text-green-600 font-medium">{selectedOrder.payment_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping to</span>
                <span className="text-gray-700 text-right max-w-48">{selectedOrder.shipping_address}</span>
              </div>
            </div>

            <h3 className="font-semibold text-gray-800 mb-3 border-t pt-3">Items</h3>
            <div className="space-y-2">
              {selectedOrder.items?.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.product_name} x{item.quantity}</span>
                  <span className="font-medium">${item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-orange-500">${selectedOrder.total_amount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}