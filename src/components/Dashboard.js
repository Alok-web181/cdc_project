"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, TrendingUp, Package, DollarSign, Tag } from "lucide-react";
import Chart from "chart.js/auto";
import Shoecard from "./Shoecard";
import Charts from "./Chartsindashboard";

// API function
const fetchShoes = async () => {
  const response = await fetch("/api/shoes");
  if (!response.ok) {
    throw new Error("Failed to fetch shoes");
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch shoes");
  }
  return result.data;
};

const Dashboard = () => {
  const router = useRouter();
  const [filteredShoes, setFilteredShoes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Use React Query
  const { data: shoes = [], isLoading, error } = useQuery({
    queryKey: ["shoes"],
    queryFn: fetchShoes,
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/");
      return;
    }
  }, [router]);

  useEffect(() => {
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

  const getTotalSales = (shoe) => {
    return shoe.salesHistory && shoe.salesHistory.length > 0
      ? shoe.salesHistory.reduce((sum, entry) => sum + entry.sales, 0)
      : shoe.sales || 0;
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
    const sortedShoes = [...filteredShoes].sort(
      (a, b) => getTotalSales(b) - getTotalSales(a)
    );

    if (showAll) {
      return sortedShoes;
    }

    return sortedShoes.slice(0, 8);
  };

  const displayedShoes = getDisplayedShoes();

  const totalSales = shoes.reduce((sum, shoe) => sum + getTotalSales(shoe), 0);
  const totalStock = shoes.reduce((sum, shoe) => sum + (shoe.stock || 0), 0);
  const totalRevenue = shoes.reduce((sum, shoe) => {
    const finalPrice = shoe.price - (shoe.price * shoe.discount) / 100;
    return sum + finalPrice * getTotalSales(shoe);
  }, 0);

  const LOW_STOCK_LIMIT = 15;

  const lowStockShoes = shoes
    .filter((shoe) => (shoe.stock || 0) < LOW_STOCK_LIMIT)
    .sort((a, b) => (a.stock || 0) - (b.stock || 0));

  if (isLoading) {
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10 bg-[linear-gradient(143.42deg,#79DEFC_2.34%,#DFA3D9_85.26%)]">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center px-4 sm:px-6 md:px-8 lg:px-10 mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Welcome Gentleman</h1>
          <p className="text-sm sm:text-base text-gray-500">Welcome to your KickCraft online portal.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <Link
            className="text-white bg-[linear-gradient(90deg,#00C0FF_0%,#5558FF_100%)] px-5 py-2 rounded-md transition-colors text-center"
            href="/add"
          >
            Add Shoe
          </Link>
          <button
            onClick={handleLogout}
            className="text-white bg-[linear-gradient(90deg,#00C0FF_0%,#5558FF_100%)] px-5 py-2 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 mb-6">
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
              <p>{`No shoes found for "${searchQuery}"`}</p>
            ) : (
              <p>
                {`Found ${filteredShoes.length} ${
                  filteredShoes.length === 1 ? "shoe" : "shoes"
                } matching "${searchQuery}"`}
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 mx-4 sm:mx-6 md:mx-8 lg:mx-10">
          {error.message}
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
          <div className="pt-10 gap-4 sm:gap-5 md:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 sm:px-6 md:px-8 lg:px-10">
            {displayedShoes.map((shoe) => (
              <Shoecard key={shoe._id} shoe={shoe} />
            ))}
          </div>

          {!searchQuery && filteredShoes.length > 8 && (
            <div className="text-center py-6">
              <button
                onClick={() => setShowAll(prev => !prev)}
                className="text-blue-600 hover:text-blue-700 font-semibold text-2xl sm:text-3xl bg-yellow-600 px-4 sm:px-5 py-2 rounded-2xl cursor-pointer"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 px-4 sm:px-6 md:px-8 lg:px-10 mb-8 mt-10">
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
          <p className="text-3xl font-bold">₹ {totalRevenue.toFixed(0)}</p>
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
      <Charts shoes={shoes} getTotalSales={getTotalSales} />

      {/* Low Stock Shoes Section */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 mt-16 mb-20">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-red-600">
            ⚠️ Low Stock Products
          </h2>
        </div>

        {lowStockShoes.length === 0 ? (
          <div className="bg-green-100 text-green-700 px-6 py-4 rounded-lg">
            ✅ All products are well stocked
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {lowStockShoes.map((shoe) => (
              <Shoecard key={shoe._id} shoe={shoe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;