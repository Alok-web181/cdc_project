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

  // Chart type states
  const [categoryChartType, setCategoryChartType] = useState("radar");
  const [priceChartType, setPriceChartType] = useState("radar");
  const [discountChartType, setDiscountChartType] = useState("doughnut");
  const [totalSalesChartType, setTotalSalesChartType] = useState("bar");

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
  }, [shoes, categoryChartType, priceChartType, discountChartType, totalSalesChartType]);

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
        type: categoryChartType,
        data: {
          labels: Object.keys(categoryData),
          datasets: [
            {
              label: "Sales by Category",
              data: Object.values(categoryData),
              backgroundColor: categoryChartType === "pie" || categoryChartType === "doughnut" 
                ? [
                    "rgba(59, 130, 246, 0.8)",
                    "rgba(16, 185, 129, 0.8)",
                    "rgba(251, 146, 60, 0.8)",
                    "rgba(236, 72, 153, 0.8)",
                    "rgba(168, 85, 247, 0.8)",
                  ]
                : "rgba(59, 130, 246, 0.8)",
              borderColor: categoryChartType === "pie" || categoryChartType === "doughnut"
                ? "#fff"
                : "rgba(59, 130, 246, 1)",
              borderWidth: 2,
              borderRadius: categoryChartType === "bar" ? 8 : 0,
              tension: categoryChartType === "line" ? 0.4 : undefined,
              fill: categoryChartType === "line" ? true : undefined,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: categoryChartType === "pie" || categoryChartType === "doughnut",
              position: "bottom",
            },
            title: {
              display: true,
              text: "Sales by Category",
              font: { size: 16, weight: "bold" },
            },
          },
          scales: categoryChartType === "pie" || categoryChartType === "doughnut" ? {} : {
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
      const price = shoe.price - (shoe.price * shoe.discount) / 100;
      const sales = shoe.sales || 0;
      if (price < 2000) priceRanges["₹0-2000"] += sales;
      else if (price < 4000) priceRanges["₹2000-4000"] += sales;
      else if (price < 6000) priceRanges["₹4000-6000"] += sales;
      else if (price < 8000) priceRanges["₹6000-8000"] += sales;
      else priceRanges["₹8000+"] += sales;
    });

    if (priceChartRef.current) {
      priceChartInstance.current = new Chart(priceChartRef.current, {
        type: priceChartType,
        data: {
          labels: Object.keys(priceRanges),
          datasets: [
            {
              label: "Sales by Price Range",
              data: Object.values(priceRanges),
              backgroundColor: priceChartType === "pie" || priceChartType === "doughnut"
                ? [
                    "rgba(16, 185, 129, 0.8)",
                    "rgba(34, 197, 94, 0.8)",
                    "rgba(132, 204, 22, 0.8)",
                    "rgba(234, 179, 8, 0.8)",
                    "rgba(251, 146, 60, 0.8)",
                  ]
                : priceChartType === "line"
                ? "rgba(16, 185, 129, 0.2)"
                : "rgba(16, 185, 129, 0.8)",
              borderColor: priceChartType === "pie" || priceChartType === "doughnut"
                ? "#fff"
                : "rgba(16, 185, 129, 1)",
              borderWidth: priceChartType === "line" ? 3 : 2,
              fill: priceChartType === "line" ? true : undefined,
              tension: priceChartType === "line" ? 0.4 : undefined,
              pointRadius: priceChartType === "line" ? 6 : undefined,
              pointBackgroundColor: priceChartType === "line" ? "rgba(16, 185, 129, 1)" : undefined,
              borderRadius: priceChartType === "bar" ? 8 : 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: priceChartType === "pie" || priceChartType === "doughnut",
              position: "bottom",
            },
            title: {
              display: true,
              text: "Sales by Price Range",
              font: { size: 16, weight: "bold" },
            },
          },
          scales: priceChartType === "pie" || priceChartType === "doughnut" ? {} : {
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
      "1-10%": 0,
      "11-20%": 0,
      "21-30%": 0,
      "31%+": 0,
    };

    shoes.forEach((shoe) => {
      const discount = shoe.discount || 0;
      const sales = shoe.sales || 0;
      if (discount === 0) discountRanges["0%"] += sales;
      else if (discount <= 10) discountRanges["1-10%"] += sales;
      else if (discount <= 20) discountRanges["11-20%"] += sales;
      else if (discount <= 30) discountRanges["21-30%"] += sales;
      else discountRanges["31%+"] += sales;
    });

    if (discountChartRef.current) {
      discountChartInstance.current = new Chart(discountChartRef.current, {
        type: discountChartType,
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
              borderColor: discountChartType === "pie" || discountChartType === "doughnut" ? "#fff" : [
                "rgba(239, 68, 68, 1)",
                "rgba(249, 115, 22, 1)",
                "rgba(234, 179, 8, 1)",
                "rgba(34, 197, 94, 1)",
                "rgba(168, 85, 247, 1)",
              ],
              borderRadius: discountChartType === "bar" ? 8 : 0,
              tension: discountChartType === "line" ? 0.4 : undefined,
              fill: discountChartType === "line" ? true : undefined,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: discountChartType === "pie" || discountChartType === "doughnut",
              position: "bottom",
            },
            title: {
              display: true,
              text: "Sales by Discount Range",
              font: { size: 16, weight: "bold" },
            },
          },
          scales: discountChartType === "pie" || discountChartType === "doughnut" ? {} : {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
            },
          },
        },
      });
    }

    // 4. Total Sales Overview
    const brandData = {};
    shoes.forEach((shoe) => {
      const brand = shoe.brand || "Unknown";
      brandData[brand] = (brandData[brand] || 0) + (shoe.sales || 0);
    });

    // Sort brands by sales and get top 4
    const sortedBrands = Object.entries(brandData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4);

    // Calculate "Others" (sum of remaining brands)
    const top4Sales = sortedBrands.reduce((sum, [, sales]) => sum + sales, 0);
    const totalBrandSales = Object.values(brandData).reduce((sum, sales) => sum + sales, 0);
    const othersSales = totalBrandSales - top4Sales;

    // Prepare final data
    const brandLabels = [...sortedBrands.map(([brand]) => brand), "Others"];
    const brandSales = [...sortedBrands.map(([, sales]) => sales), othersSales];

    if (totalSalesChartRef.current) { 
      totalSalesChartInstance.current = new Chart(totalSalesChartRef.current, {
        type: totalSalesChartType,
        data: {
          labels: brandLabels,
          datasets: [
            {
              label: "Sales by Brand",
              data: brandSales,
              backgroundColor: [
                "rgba(99, 102, 241, 0.8)",
                "rgba(236, 72, 153, 0.8)",
                "rgba(251, 146, 60, 0.8)",
                "rgba(14, 165, 233, 0.8)",
                "rgba(156, 163, 175, 0.8)",
              ],
              borderColor: totalSalesChartType === "pie" || totalSalesChartType === "doughnut" ? "#fff" : [
                "rgba(99, 102, 241, 1)",
                "rgba(236, 72, 153, 1)",
                "rgba(251, 146, 60, 1)",
                "rgba(14, 165, 233, 1)",
                "rgba(156, 163, 175, 1)",
              ],
              borderWidth: 2,
              borderRadius: totalSalesChartType === "bar" ? 8 : 0,
              tension: totalSalesChartType === "line" ? 0.4 : undefined,
              fill: totalSalesChartType === "line" ? true : undefined,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: totalSalesChartType === "pie" || totalSalesChartType === "doughnut",
              position: "bottom",
            },
            title: {
              display: true,
              text: "Sales by Brand",
              font: { size: 16, weight: "bold" },
            },
          },
          scales: totalSalesChartType === "pie" || totalSalesChartType === "doughnut" ? {} : {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
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
            className="text-white bg-[linear-gradient(90deg,#00C0FF_0%,#5558FF_100%)] px-5 py-2 rounded-md transition-colors"
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
                className="w-full pl-12 pr-4 py-3 border-2 rounded-lg border-blue-500 focus:border-orange-500 focus:outline-none transition-colors text-gray-700 placeholder-blue-600"
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
          <div className="pt-10 gap-6 grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] px-10">
            {displayedShoes.map((shoe) => (
              <Shoecard key={shoe._id} shoe={shoe} />
            ))}
          </div>

          {!searchQuery && filteredShoes.length > 8 && (
            <div className="text-center py-6">
              <button
                onClick={() => setShowAll(prev => !prev)}
                className="text-blue-600 hover:text-blue-700 font-semibold text-3xl bg-yellow-600 px-5 py-2 rounded-2xl cursor-pointer"
              >
                {showAll
                  ? "Show Less"
                  : `View All (${filteredShoes.length - 8} more)`}
              </button>
            </div>
          )}
        </>
      )}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-10 mb-8 mt-10">
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
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={() => setCategoryChartType("bar")}
                className={`px-3 py-1 text-sm rounded ${
                  categoryChartType === "bar"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Bar
              </button>
              {/* <button
                onClick={() => setCategoryChartType("line")}
                className={`px-3 py-1 text-sm rounded ${
                  categoryChartType === "line"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Line
              </button> */}
              <button
                onClick={() => setCategoryChartType("pie")}
                className={`px-3 py-1 text-sm rounded ${
                  categoryChartType === "pie"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Pie
              </button>
              <button
                onClick={() => setCategoryChartType("doughnut")}
                className={`px-3 py-1 text-sm rounded ${
                  categoryChartType === "doughnut"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Doughnut
              </button>
            </div>
            <div className="h-80">
              <canvas ref={categoryChartRef}></canvas>
            </div>
          </div>

          {/* Chart 2: Price Range */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={() => setPriceChartType("bar")}
                className={`px-3 py-1 text-sm rounded ${
                  priceChartType === "bar"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setPriceChartType("radar")}
                className={`px-3 py-1 text-sm rounded ${
                  priceChartType === "radar"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                radar
              </button>
              <button
                onClick={() => setPriceChartType("pie")}
                className={`px-3 py-1 text-sm rounded ${
                  priceChartType === "pie"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Pie
              </button>
              <button
                onClick={() => setPriceChartType("doughnut")}
                className={`px-3 py-1 text-sm rounded ${
                  priceChartType === "doughnut"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Doughnut
              </button>
            </div>
            <div className="h-80">
              <canvas ref={priceChartRef}></canvas>
            </div>
          </div>

          {/* Chart 3: Discount */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={() => setDiscountChartType("bar")}
                className={`px-3 py-1 text-sm rounded ${
                  discountChartType === "bar"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setDiscountChartType("radar")}
                className={`px-3 py-1 text-sm rounded ${
                  discountChartType === "radar"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                radar
              </button>
              <button
                onClick={() => setDiscountChartType("pie")}
                className={`px-3 py-1 text-sm rounded ${
                  discountChartType === "pie"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Pie
              </button>
              <button
                onClick={() => setDiscountChartType("doughnut")}
                className={`px-3 py-1 text-sm rounded ${
                  discountChartType === "doughnut"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Doughnut
              </button>
            </div>
            <div className="h-80">
              <canvas ref={discountChartRef}></canvas>
            </div>
          </div>

          {/* Chart 4: Sales vs Brands */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={() => setTotalSalesChartType("bar")}
                className={`px-3 py-1 text-sm rounded ${
                  totalSalesChartType === "bar"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setTotalSalesChartType("radar")}
                className={`px-3 py-1 text-sm rounded ${
                  totalSalesChartType === "radar"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                radar
              </button>
              <button
                onClick={() => setTotalSalesChartType("pie")}
                className={`px-3 py-1 text-sm rounded ${
                  totalSalesChartType === "pie"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Pie
              </button>
              <button
                onClick={() => setTotalSalesChartType("doughnut")}
                className={`px-3 py-1 text-sm rounded ${
                  totalSalesChartType === "doughnut"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Doughnut
              </button>
            </div>
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