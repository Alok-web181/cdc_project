"use client";
import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";

const Charts = ({ shoes, getTotalSales }) => {
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
  const [categoryChartType, setCategoryChartType] = useState("pie");
  const [priceChartType, setPriceChartType] = useState("radar");
  const [discountChartType, setDiscountChartType] = useState("doughnut");
  const [totalSalesChartType, setTotalSalesChartType] = useState("bar");

  useEffect(() => {
    if (shoes && shoes.length > 0) {
      createCharts();
    }

    return () => {
      destroyCharts();
    };
  }, [shoes, categoryChartType, priceChartType, discountChartType, totalSalesChartType]);

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
      categoryData[category] = (categoryData[category] || 0) + getTotalSales(shoe);
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
      const sales = getTotalSales(shoe);
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
      const sales = getTotalSales(shoe);
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
      brandData[brand] = (brandData[brand] || 0) + getTotalSales(shoe);
    });

    const sortedBrands = Object.entries(brandData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4);

    const top4Sales = sortedBrands.reduce((sum, [, sales]) => sum + sales, 0);
    const totalBrandSales = Object.values(brandData).reduce((sum, sales) => sum + sales, 0);
    const othersSales = totalBrandSales - top4Sales;

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

  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-10 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Sales Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {/* Chart 1: Category */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-wrap justify-end gap-2 mb-4">
              <button
                onClick={() => setCategoryChartType("bar")}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                  categoryChartType === "bar"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setCategoryChartType("pie")}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                  categoryChartType === "pie"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Pie
              </button>
              <button
                onClick={() => setCategoryChartType("doughnut")}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                  categoryChartType === "doughnut"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Doughnut
              </button>
            </div>
            <div className="h-64 sm:h-80">
              <canvas ref={categoryChartRef}></canvas>
            </div>
          </div>

          {/* Chart 2: Price Range */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-wrap justify-end gap-2 mb-4">
              <button
                onClick={() => setPriceChartType("bar")}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                  priceChartType === "bar"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setPriceChartType("radar")}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                  priceChartType === "radar"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Radar
              </button>
              <button
                onClick={() => setPriceChartType("pie")}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                  priceChartType === "pie"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Pie
              </button>
              <button
                onClick={() => setPriceChartType("doughnut")}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                  priceChartType === "doughnut"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Doughnut
              </button>
            </div>
            <div className="h-64 sm:h-80">
              <canvas ref={priceChartRef}></canvas>
            </div>
          </div>

          
          {/* Chart 3: Discount */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-wrap justify-end gap-2 mb-4">
              <button
                onClick={() => setDiscountChartType("bar")}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                  discountChartType === "bar"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setDiscountChartType("radar")}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                  discountChartType === "radar"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Radar
              </button>
              <button
                onClick={() => setDiscountChartType("pie")}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                  discountChartType === "pie"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Pie
              </button>
              <button
                onClick={() => setDiscountChartType("doughnut")}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                  discountChartType === "doughnut"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Doughnut
              </button>
            </div>
            <div className="h-64 sm:h-80">
              <canvas ref={discountChartRef}></canvas>
            </div>
          </div>

          {/* Chart 4: Sales vs Brands */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-wrap justify-end gap-2 mb-4">
              <button
                onClick={() => setTotalSalesChartType("bar")}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                  totalSalesChartType === "bar"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setTotalSalesChartType("radar")}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                  totalSalesChartType === "radar"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Radar
              </button>
              <button
                onClick={() => setTotalSalesChartType("pie")}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                  totalSalesChartType === "pie"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Pie
              </button>
              <button
                onClick={() => setTotalSalesChartType("doughnut")}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                  totalSalesChartType === "doughnut"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Doughnut
              </button>
            </div>
            <div className="h-64 sm:h-80">
              <canvas ref={totalSalesChartRef}></canvas>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Charts;