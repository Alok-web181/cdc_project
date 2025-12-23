"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Package, Tag, TrendingUp, Clock, History } from "lucide-react";


const ShoeDetail = ({ params }) => {
  const router = useRouter();
  const [shoe, setShoe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

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
        setShoe(result.data);
      } else {
        setError("Failed to load shoe details");
      }
    } catch (err) {
      console.error("Error fetching shoe details:", err);
      setError("Failed to load shoe details");
    } finally {
      setLoading(false);
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

  if (error || !shoe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error || "Shoe not found"}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const finalPrice = shoe.price - (shoe.price * shoe.discount) / 100;
  const mainImage = shoe.images && shoe.images.length > 0 ? shoe.images[selectedImage] : "/shoe.webp";

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push(`/dashboard/${params.id}/edit`)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold cursor-pointer"
          >
            <Edit size={18} />
            Edit Shoe
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Images Section */}
          <div>
            {/* Main Image */}
            <div className="relative bg-gray-100 rounded-xl overflow-hidden mb-4 h-96 flex items-center justify-center">
              <img
                src={mainImage}
                alt={shoe.name}
                className="w-full h-full object-cover"
              />
              {shoe.discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {shoe.discount}% OFF
                </span>
              )}
              {shoe.stock === 0 && (
                <span className="absolute top-4 right-4 bg-gray-700 text-white text-sm font-bold px-3 py-1 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Thumbnail Images */}
            {shoe.images && shoe.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {shoe.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative bg-gray-100 rounded-lg overflow-hidden h-24 border-2 transition-all ${
                      selectedImage === idx
                        ? "border-blue-600 ring-2 ring-blue-200"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${shoe.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Brand */}
              <p className="text-sm text-blue-600 uppercase tracking-wide font-semibold mb-2">
                {shoe.brand}
              </p>

              {/* Name */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {shoe.name}
              </h1>

              {/* Category */}
              <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full mb-6">
                <Tag size={16} className="text-gray-600" />
                <span className="text-sm text-gray-700 font-medium">
                  {shoe.category}
                </span>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ₹{finalPrice.toFixed(2)}
                  </span>
                  {shoe.discount > 0 && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        ₹{shoe.price.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Package size={18} className="text-blue-600" />
                    <p className="text-sm text-gray-600">Stock Available</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {shoe.stock} units
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={18} className="text-green-600" />
                    <p className="text-sm text-gray-600">Total Sales</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {shoe.sales || 0}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Added On</span>
                  <span className="text-gray-900">
                    {new Date(shoe.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-gray-900">
                    {new Date(shoe.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales History Section */}
      {shoe.salesHistory && shoe.salesHistory.length > 0 && (
        <div className="max-w-7xl mx-auto mt-8 bg-white rounded-2xl shadow-lg overflow-hidden p-8">
          <div className="flex items-center gap-3 mb-6">
            <History size={24} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Sales History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Sales Count
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Discount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Final Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...shoe.salesHistory].reverse().map((entry, idx) => {
                  const entryFinalPrice = entry.price - (entry.price * entry.discount) / 100;
                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-900 font-medium">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(entry.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          <TrendingUp size={14} />
                          {entry.sales}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-900 font-medium">
                        ₹{entry.price.toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        {entry.discount > 0 ? (
                          <span className="inline-flex items-center bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                            {entry.discount}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">No discount</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-blue-600 font-bold text-lg">
                          ₹{entryFinalPrice.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {shoe.salesHistory.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <History size={48} className="mx-auto mb-4 opacity-30" />
              <p>No sales history available yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShoeDetail;