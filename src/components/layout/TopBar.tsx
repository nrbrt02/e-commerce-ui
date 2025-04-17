import React, { useState } from "react";

const TopBar: React.FC = () => {
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [pincode, setPincode] = useState("425651");

  const toggleLocationDropdown = () => {
    setIsLocationDropdownOpen(!isLocationDropdownOpen);
  };

  return (
    <div className="bg-gradient-to-r from-sky-100 to-sky-200 px-4 py-2 shadow-sm">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-sm">
          {/* Welcome message - Hidden on smallest screens */}
          <div className="hidden sm:block text-sky-800 font-medium">
            Welcome to Fast Shopping!
          </div>

          {/* Mobile top links - only visible on mobile */}
          <div className="flex w-full justify-between md:hidden py-1">
            <div className="text-sky-800 font-medium">Fast Shopping</div>
            <button
              className="text-sky-700 hover:text-sky-900 transition-colors duration-200"
              onClick={toggleLocationDropdown}
            >
              <i className="fas fa-map-marker-alt mr-1"></i> {pincode}
            </button>
          </div>

          {/* Main links */}
          <div className="flex flex-wrap gap-3 md:gap-6 text-sky-700 w-full md:w-auto justify-between md:justify-end">
            {/* Location dropdown - Hidden on mobile (separate version above) */}
            <div className="relative hidden md:block">
              <button
                className="flex items-center hover:text-sky-900 transition-colors duration-200"
                onClick={toggleLocationDropdown}
              >
                <i className="fas fa-map-marker-alt mr-1"></i> Deliver to:{" "}
                {pincode}
                <i className="fas fa-chevron-down text-xs ml-1"></i>
              </button>

              {isLocationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 p-3 border border-sky-200">
                  <div className="text-sky-900 font-medium mb-2">
                    Update your delivery location
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-l-md bg-white text-gray-800 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                      placeholder="Enter pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                    <button
                      className="bg-sky-600 text-white px-3 py-2 rounded-r-md hover:bg-sky-700 transition-colors duration-200"
                      onClick={() => setIsLocationDropdownOpen(false)}
                    >
                      Update
                    </button>
                  </div>
                </div>
              )}
            </div>

            <a
              href="#"
              className="flex items-center hover:text-sky-900 transition-colors duration-200"
            >
              <i className="fas fa-truck mr-1"></i> Track Order
            </a>

            <a
              href="#"
              className="flex items-center hover:text-sky-900 transition-colors duration-200"
            >
              <i className="fas fa-tag mr-1"></i> All Offers
            </a>

            <a
              href="#"
              className="flex items-center hover:text-sky-900 transition-colors duration-200 hidden sm:flex"
            >
              <i className="fas fa-headset mr-1"></i> Help
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
