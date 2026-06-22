import { useEffect, useState } from "react";
import { useAppAuth } from "../../context/AuthContext";
import { productAPI } from "../../services/api";
import { Plus, Pencil, Trash2, Package, X, Check } from "lucide-react";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock_quantity: "",
  image_url: "",
  image_data: "",
  category: "",
};

export default function AdminInventory() {
  const { getAuthHeader } = useAppAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getAll();
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const headers = await getAuthHeader();
      const data = {
        ...form,
        price: parseFloat(form.price),
        stock_quantity: parseInt(form.stock_quantity),
      };

      if (editingProduct) {
        await productAPI.update(editingProduct.id, data, headers);
      } else {
        await productAPI.create(data, headers);
      }

      await fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
      setForm(emptyForm);
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      image_url: product.image_url,
      image_data: "",
      category: product.category,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const headers = await getAuthHeader();
      await productAPI.delete(id, headers);
      await fetchProducts();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleStockUpdate = async (product, newStock) => {
    try {
      const headers = await getAuthHeader();
      await productAPI.updateStock(product.id, { stock_quantity: parseInt(newStock) }, headers);
      await fetchProducts();
    } catch (error) {
      console.error("Stock update error:", error);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management 📦</h1>
          <p className="text-gray-400 text-sm">{products.length} products total</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingProduct(null); setForm(emptyForm); }}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition font-medium"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Product</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Category</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Price</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Stock</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-400 max-w-48 truncate">{product.description}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-xs bg-orange-50 text-orange-500 px-2 py-1 rounded-full font-medium">
                    {product.category}
                  </span>
                </td>
                <td className="p-4 font-bold text-gray-800">${product.price}</td>
                <td className="p-4">
                  <input
                    type="number"
                    defaultValue={product.stock_quantity}
                    className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-orange-400"
                    onBlur={(e) => {
                      if (parseInt(e.target.value) !== product.stock_quantity) {
                        handleStockUpdate(product, e.target.value);
                      }
                    }}
                  />
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    product.stock_quantity === 0
                      ? "bg-red-100 text-red-600"
                      : product.stock_quantity < 10
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }`}>
                    {product.stock_quantity === 0
                      ? "Out of Stock"
                      : product.stock_quantity < 10
                      ? "Low Stock"
                      : "In Stock"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: "Product Name", field: "name", type: "text" },
                { label: "Price ($)", field: "price", type: "number" },
                { label: "Stock Quantity", field: "stock_quantity", type: "number" },
                { label: "Category", field: "category", type: "text" },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setForm(prev => ({ ...prev, image_data: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400 resize-none"
                />
              </div>

              {(form.image_data || form.image_url) && (
                <img
                  src={form.image_data || form.image_url}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-xl"
                />
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : editingProduct ? "Update" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <Trash2 className="mx-auto text-red-400 mb-3" size={48} />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Product?</h3>
            <p className="text-gray-400 mb-6 text-sm">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}