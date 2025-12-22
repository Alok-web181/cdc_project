"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";

const EditShoe = ({ params }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    discount: "",
    stock: "",
    sales: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/");
      return;
    }

    fetchShoeDetails();
  }, [params.id, router]);

  const fetchShoeDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shoes/${params.id}`);
      const result = await response.json();

      if (result.success) {
        const shoe = result.data;
        setFormData({
          name: shoe.name,
          brand: shoe.brand,
          price: shoe.price,
          discount: shoe.discount || 0,
          stock: shoe.stock,
          sales: shoe.sales,
        });
      } else {
        setError("Failed to load shoe details");
      }
    } catch (err) {
      console.error("Error fetching shoe:", err);
      setError("Failed to load shoe details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("brand", formData.brand);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("discount", formData.discount || 0);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("sales", formData.sales);

      const res = await fetch(`/api/shoes/${params.id}`, {
        method: "PUT",
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Shoe updated successfully!");
        router.push(`/dashboard/${params.id}`);
      } else {
        setError(data.error || "Failed to update shoe");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong! Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this shoe? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/shoes/${params.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        alert("Shoe deleted successfully!");
        router.push("/dashboard");
      } else {
        setError(data.error || "Failed to delete shoe");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong! Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shoe details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push(`/dashboard/${params.id}`)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
            Back to Details
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 cursor-pointer">Edit Shoe</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Shoe Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent text-black"
                required
                readOnly
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-blue-500 focus:border-transparent"
                required
                readOnly
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="100"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  sales
                </label>
                <input
                  type="text"
                  name="sales"
                  value={formData.sales}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving || deleting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={saving || deleting}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={18} />
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditShoe;