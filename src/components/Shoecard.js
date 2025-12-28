"use client";
import Link from "next/link";

const Shoecard = ({ shoe }) => {
  const finalPrice = shoe.price - (shoe.price * shoe.discount) / 100;
  const mainImage = shoe.images && shoe.images.length > 0 ? shoe.images[0] : "/shoe.webp";
  const totalSales = shoe.salesHistory && shoe.salesHistory.length > 0
  ? shoe.salesHistory.reduce((sum, entry) => sum + entry.sales, 0)
  : shoe.sales || 0;

  return (
    <div className="bg-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
      
      {/* Image */}
      <div className="relative h-72 bg-zinc-800 flex items-center justify-center">
        <img
          src={mainImage}
          alt={shoe.name}
          className="h-full w-full object-cover object-center"
        />

        {shoe.discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {shoe.discount}% OFF
          </span>
        )}

        {shoe.stock === 0 && (
          <span className="absolute top-3 right-3 bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded-full">
            Out of Stock
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <p className="text-xs text-amber-300 uppercase tracking-wide">
          {shoe.brand}
        </p>

        <h3 className="text-amber-600 font-semibold text-base truncate">
          {shoe.name}
        </h3>
        <h4 className=" bg-zinc-600 w-fit text-white text-xs font-semibold px-2 py-1 mb-2 rounded-full truncate">
          {shoe.category}
        </h4>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-amber-600">
            ₹{finalPrice.toFixed(2)}
          </span>
          {shoe.discount > 0 && (
            <span className="text-sm text-amber-300 line-through">
              ₹{shoe.price}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-amber-300">
          <span>Stock: {shoe.stock}</span>
          <span>Sales: {totalSales}</span>
        </div>

        
          <Link className="text-black py-2 px-5 bg-amber-400 rounded-md hover:bg-amber-500 transition-colors text-lg font-semibold" href={`/dashboard/${shoe._id}`}>
            View More
          </Link>
        
      </div>
    </div>
  );
};

export default Shoecard;