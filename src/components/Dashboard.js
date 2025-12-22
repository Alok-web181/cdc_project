"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, EyeOff, TrendingUp, Package, DollarSign, Tag } from "lucide-react";
import Chart from "chart.js/auto";
import Shoecard from "./Shoecard";

const Dashboard = () => {
  const router = useRouter();
  const [shoes, setShoes] = useState([]);
  const [filteredShoes, setFilteredShoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Chart refs
  const categoryChartRef = useRef(null);
  const priceChartRef = useRef(null);
  const discountChartRef = useRef(null);
  const totalSalesChartRef = useRef(null);

  // Chart instances
  const categoryChartInstance = useRef(null);
  const priceChartInstance = useRef(null);
  const discountChartInstance = useRef(null);
  const totalSalesChartInstance = useRef(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/");
      return;
    }

    fetchShoes();
  }, [router]);

  useEffect(() => {
    // Filter shoes based on search query
    if (searchQuery.trim() === "") {
      setFilteredShoes(shoes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = shoes.filter(
        (shoe) =>
          shoe.name.toLowerCase().includes(query) ||
          shoe.brand.toLowerCase().includes(query) ||
          shoe.category.toLowerCase().includes(query)
      );
      setFilteredShoes(filtered);
    }
  }, [searchQuery, shoes]);

  useEffect(() => {
    if (shoes.length > 0) {
      createCharts();
    }

    // Cleanup charts on unmount
    return () => {
      destroyCharts();
    };
  }, [shoes]);

  const fetchShoes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/shoes");
      const result = await response.json();

      if (result.success) {
        setShoes(result.data);
        setFilteredShoes(result.data);
      } else {
        setError("Failed to load shoes");
      }
    } catch (err) {
      console.error("Error fetching shoes:", err);
      setError("Failed to load shoes");
    } finally {
      setLoading(false);
    }
  };

  const destroyCharts = () => {
    if (categoryChartInstance.current) categoryChartInstance.current.destroy();
    if (priceChartInstance.current) priceChartInstance.current.destroy();
    if (discountChartInstance.current) discountChartInstance.current.destroy();
    if (totalSalesChartInstance.current) totalSalesChartInstance.current.destroy();
  };

  const createCharts = () => {
    destroyCharts();

    // 1. Sales vs Categories
    const categoryData = {};
    shoes.forEach((shoe) => {
      const category = shoe.category || "Uncategorized";
      categoryData[category] = (categoryData[category] || 0) + (shoe.sales || 0);
    });

    if (categoryChartRef.current) {
      categoryChartInstance.current = new Chart(categoryChartRef.current, {
        type: "bar",
        data: {
          labels: Object.keys(categoryData),
          datasets: [
            {
              label: "Sales by Category",
              data: Object.values(categoryData),
              backgroundColor: "rgba(59, 130, 246, 0.8)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 2,
              borderRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Sales by Category",
              font: { size: 16, weight: "bold" },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
            },
          },
        },
      });
    }

    // 2. Sales vs Price Range
    const priceRanges = {
      "₹0-2000": 0,
      "₹2000-4000": 0,
      "₹4000-6000": 0,
      "₹6000-8000": 0,
      "₹8000+": 0,
    };

    shoes.forEach((shoe) => {
      const price = shoe.price;
      const sales = shoe.sales || 0;
      if (price < 2000) priceRanges["₹0-2000"] += sales;
      else if (price < 4000) priceRanges["₹2000-4000"] += sales;
      else if (price < 6000) priceRanges["₹4000-6000"] += sales;
      else if (price < 8000) priceRanges["₹6000-8000"] += sales;
      else priceRanges["₹8000+"] += sales;
    });

    if (priceChartRef.current) {
      priceChartInstance.current = new Chart(priceChartRef.current, {
        type: "line",
        data: {
          labels: Object.keys(priceRanges),
          datasets: [
            {
              label: "Sales by Price Range",
              data: Object.values(priceRanges),
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              borderColor: "rgba(16, 185, 129, 1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 6,
              pointBackgroundColor: "rgba(16, 185, 129, 1)",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Sales by Price Range",
              font: { size: 16, weight: "bold" },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
            },
          },
        },
      });
    }

    // 3. Sales vs Discount
    const discountRanges = {
      "0%": 0,
      "1-20%": 0,
      "21-40%": 0,
      "41-60%": 0,
      "61%+": 0,
    };

    shoes.forEach((shoe) => {
      const discount = shoe.discount || 0;
      const sales = shoe.sales || 0;
      if (discount === 0) discountRanges["0%"] += sales;
      else if (discount <= 20) discountRanges["1-20%"] += sales;
      else if (discount <= 40) discountRanges["21-40%"] += sales;
      else if (discount <= 60) discountRanges["41-60%"] += sales;
      else discountRanges["61%+"] += sales;
    });

    if (discountChartRef.current) {
      discountChartInstance.current = new Chart(discountChartRef.current, {
        type: "doughnut",
        data: {
          labels: Object.keys(discountRanges),
          datasets: [
            {
              label: "Sales by Discount",
              data: Object.values(discountRanges),
              backgroundColor: [
                "rgba(239, 68, 68, 0.8)",
                "rgba(249, 115, 22, 0.8)",
                "rgba(234, 179, 8, 0.8)",
                "rgba(34, 197, 94, 0.8)",
                "rgba(168, 85, 247, 0.8)",
              ],
              borderWidth: 2,
              borderColor: "#fff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
            title: {
              display: true,
              text: "Sales by Discount Range",
              font: { size: 16, weight: "bold" },
            },
          },
        },
      });
    }

    // 4. Total Sales Overview
    const totalSales = shoes.reduce((sum, shoe) => sum + (shoe.sales || 0), 0);
    const totalStock = shoes.reduce((sum, shoe) => sum + (shoe.stock || 0), 0);
    const totalProducts = shoes.length;
    const avgSales = totalProducts > 0 ? (totalSales / totalProducts).toFixed(1) : 0;

    if (totalSalesChartRef.current) {
      totalSalesChartInstance.current = new Chart(totalSalesChartRef.current, {
        type: "bar",
        data: {
          labels: ["Total Sales", "Total Stock", "Total Products", "Avg Sales/Product"],
          datasets: [
            {
              label: "Overview",
              data: [totalSales, totalStock, totalProducts, parseFloat(avgSales)],
              backgroundColor: [
                "rgba(99, 102, 241, 0.8)",
                "rgba(236, 72, 153, 0.8)",
                "rgba(251, 146, 60, 0.8)",
                "rgba(14, 165, 233, 0.8)",
              ],
              borderColor: [
                "rgba(99, 102, 241, 1)",
                "rgba(236, 72, 153, 1)",
                "rgba(251, 146, 60, 1)",
                "rgba(14, 165, 233, 1)",
              ],
              borderWidth: 2,
              borderRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Business Overview",
              font: { size: 16, weight: "bold" },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const getDisplayedShoes = () => {
    if (showAll) {
      return filteredShoes;
    }
    return filteredShoes.slice(0, 8);
  };

  const displayedShoes = getDisplayedShoes();
  const hasMoreShoes = filteredShoes.length > 8;

  // Calculate stats
  const totalSales = shoes.reduce((sum, shoe) => sum + (shoe.sales || 0), 0);
  const totalStock = shoes.reduce((sum, shoe) => sum + (shoe.stock || 0), 0);
  const totalRevenue = shoes.reduce((sum, shoe) => {
    const finalPrice = shoe.price - (shoe.price * shoe.discount) / 100;
    return sum + finalPrice * (shoe.sales || 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-10 bg-[linear-gradient(143.42deg,#79DEFC_2.34%,#DFA3D9_85.26%)]">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center px-10 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-800 via-orange-500 to-orange-600 bg-clip-text text-transparent">Welcome Gentleman</h1>
          <p className="bg-gradient-to-r from-yellow-800 via-orange-500 to-orange-600 bg-clip-text text-transparent">Welcome to your Kickkraft online portal.</p>
        </div>
        <div className="flex gap-4">
          <a
            className="text-black bg-[linear-gradient(90deg,#00C0FF_0%,#5558FF_100%)] px-5 py-2 rounded-md transition-colors"
            href="/add"
          >
            Add Shoe
          </a>
          <button
            onClick={handleLogout}
            className="text-white bg-[linear-gradient(90deg,#00C0FF_0%,#5558FF_100%)] px-5 py-2 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search Bar and View Toggle */}
      <div className="px-10 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Catalog</h2>
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name, brand, or category..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 border-2 rounded-lg border-blue-500 focus:outline-none transition-colors text-gray-700 placeholder:text-blue-600"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {hasMoreShoes && !searchQuery && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors font-medium"
            >
              {showAll ? (
                <>
                  <EyeOff size={20} />
                  Show Less
                </>
              ) : (
                <>
                  <Eye size={20} />
                  View All ({filteredShoes.length})
                </>
              )}
            </button>
          )}
        </div>

        {searchQuery && (
          <div className="mt-3 text-sm text-gray-600">
            {filteredShoes.length === 0 ? (
              <p>No shoes found for "{searchQuery}"</p>
            ) : (
              <p>
                Found {filteredShoes.length}{" "}
                {filteredShoes.length === 1 ? "shoe" : "shoes"} matching "
                {searchQuery}"
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 mx-10">
          {error}
        </div>
      )}

      {/* Shoes Grid */}
      {displayedShoes.length === 0 ? (
        <div className="text-center py-20">
          {searchQuery ? (
            <>
              <p className="text-gray-600 text-xl">No shoes match your search</p>
              <p className="text-gray-400 mt-2">Try a different search term</p>
              <button
                onClick={clearSearch}
                className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 text-xl">No shoes available</p>
              <p className="text-gray-400 mt-2">
                Add your first shoe to get started
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="py-10 gap-6 grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] px-10">
            {displayedShoes.map((shoe) => (
              <Shoecard key={shoe._id} shoe={shoe} />
            ))}
          </div>

          {!showAll && hasMoreShoes && !searchQuery && (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-3">
                Showing {displayedShoes.length} of {filteredShoes.length} shoes
              </p>
              <button
                onClick={() => setShowAll(true)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Click "View All" to see {filteredShoes.length - 8} more shoes
              </button>
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-10 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={32} />
            <span className="text-sm opacity-80">Total</span>
          </div>
          <p className="text-3xl font-bold">{totalSales}</p>
          <p className="text-sm opacity-90">Total Sales</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Package size={32} />
            <span className="text-sm opacity-80">Units</span>
          </div>
          <p className="text-3xl font-bold">{totalStock}</p>
          <p className="text-sm opacity-90">Total Stock</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={32} />
            <span className="text-sm opacity-80">Revenue</span>
          </div>
          <p className="text-3xl font-bold">₹{totalRevenue.toFixed(0)}</p>
          <p className="text-sm opacity-90">Total Revenue</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Tag size={32} />
            <span className="text-sm opacity-80">Items</span>
          </div>
          <p className="text-3xl font-bold">{shoes.length}</p>
          <p className="text-sm opacity-90">Total Products</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="px-10 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Sales Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Category */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="h-80">
              <canvas ref={categoryChartRef}></canvas>
            </div>
          </div>

          {/* Chart 2: Price Range */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="h-80">
              <canvas ref={priceChartRef}></canvas>
            </div>
          </div>

          {/* Chart 3: Discount */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="h-80">
              <canvas ref={discountChartRef}></canvas>
            </div>
          </div>

          {/* Chart 4: Total Sales Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="h-80">
              <canvas ref={totalSalesChartRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;