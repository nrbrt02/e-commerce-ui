import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Fast Shopping. All rights
              reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <img
                src="https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/visa.svg"
                alt="Visa"
                className="h-6"
              />
              <img
                src="https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/mastercard.svg"
                alt="Mastercard"
                className="h-6"
              />
              <img
                src="https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/paypal.svg"
                alt="PayPal"
                className="h-6"
              />
              <img
                src="https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/applepay.svg"
                alt="Apple Pay"
                className="h-6"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
