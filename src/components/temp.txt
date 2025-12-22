// src/components/Dashboard.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Shoecard from "./Shoecard";



const Dashboard = () => {
  const router = useRouter();
  const [shoes, setShoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailedError, setDetailedError] = useState(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/");
      return;
    }

    fetchShoes();
  }, [router]);

  const fetchShoes = async () => {
    try {
      setLoading(true);
      setError(null);
      setDetailedError(null);

      console.log('Fetching shoes from /api/shoes...');
      
      const response = await fetch("/api/shoes", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const result = await response.json();
      console.log('Response data:', result);

      if (result.success) {
        setShoes(result.data);
        console.log(`Successfully loaded ${result.data.length} shoes`);
      } else {
        const errorMsg = result.error || "Failed to load shoes";
        setError(errorMsg);
        setDetailedError(result.details);
        console.error('API returned error:', errorMsg);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Network error: ${err.message}`);
      setDetailedError(err.stack);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  const handleRetry = () => {
    fetchShoes();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shoes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(143.42deg,#79DEFC_2.34%,#DFA3D9_85.26%)] p-10">
      <div className="flex flex-row justify-between items-center px-10 mb-6">
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 mx-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-bold mb-2">Error Loading Shoes</p>
              <p className="mb-2">{error}</p>
              
              {detailedError && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm underline">
                    Show technical details
                  </summary>
                  <pre className="mt-2 p-2 bg-red-50 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(detailedError, null, 2)}
                  </pre>
                </details>
              )}
              
              <div className="mt-3 text-sm">
                <p className="font-semibold mb-1">Troubleshooting steps:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check if MongoDB is connected</li>
                  <li>Verify .env.local file exists</li>
                  <li>Restart development server</li>
                  <li>Test connection at <a href="/api/db-test" className="underline text-blue-600" target="_blank">/api/db-test</a></li>
                </ul>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex-shrink-0"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!error && shoes.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-600 text-xl">No shoes available</p>
          <p className="text-gray-400 mt-2">Add your first shoe to get started</p>
          <a
            href="/add"
            className="mt-6 inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Add Your First Shoe
          </a>
        </div>
      )}

      {!error && shoes.length > 0 && (
        <div className="py-10 gap-6 grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
          {shoes.map((shoe) => (
            <Shoecard key={shoe._id} shoe={shoe} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;