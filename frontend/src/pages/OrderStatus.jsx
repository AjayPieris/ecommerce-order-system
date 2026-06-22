import { useEffect, useState } from "react";
import { useAppAuth } from "../context/AuthContext";
import { orderAPI } from "../services/api";
import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";

const STATUS_STEPS = ["PENDING", "PAYMENT_CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

const statusIcon = (status) => {
  const icons = {
    PENDING: <Clock className="text-gray-500" size={20} />,
    PAYMENT_CONFIRMED: <CheckCircle className="text-gray-700" size={20} />,
    PROCESSING: <Package className="text-gray-900" size={20} />,
    SHIPPED: <Truck className="text-gray-900" size={20} />,
    DELIVERED: <CheckCircle className="text-green-500" size={20} />,
    CANCELLED: <XCircle className="text-red-500" size={20} />,
  };
  return icons[status] || <Clock size={20} />;
};

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
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="bg-gray-50/30 min-h-screen pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 text-lg">No orders yet!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-lg hover:shadow-gray-200/50 transition duration-300 cursor-pointer group"
              onClick={() => fetchOrderDetail(order.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg group-hover:underline decoration-2 underline-offset-4">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500 mt-1">{order.created_at?.slice(0, 10)}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900 text-xl mb-2">${order.total_amount}</p>
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
                        <div key={step} className="flex flex-col items-center flex-1 relative z-10">
                          <div className={`w-5 h-5 rounded-full border-4 ${
                            isCompleted
                              ? "bg-gray-900 border-gray-900"
                              : "bg-white border-gray-200"
                          }`} />
                          {index < STATUS_STEPS.length - 1 && (
                            <div className={`absolute top-2.5 left-1/2 w-full h-1 -z-10 ${
                              index < currentIndex ? "bg-gray-900" : "bg-gray-100"
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
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">Order #{selectedOrder.id}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 transition"
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

            <h3 className="font-bold text-gray-900 mb-4 border-t border-gray-100 pt-6">Items</h3>
            <div className="space-y-3">
              {selectedOrder.items?.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.product_name} <span className="font-bold text-gray-900 text-xs ml-1">x{item.quantity}</span></span>
                  <span className="font-bold text-gray-900">${item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-6 pt-4 flex justify-between font-black text-lg">
              <span>Total</span>
              <span className="text-gray-900">${selectedOrder.total_amount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}