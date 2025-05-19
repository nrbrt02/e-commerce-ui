import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Footer: React.FC = () => {
  const { openAuthModal } = useAuth();

  return (
    <footer className="bg-white border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">About Us</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-600 hover:text-gray-900">About Fast Shopping</Link></li>
              <li><Link to="/careers" className="text-gray-600 hover:text-gray-900">Careers</Link></li>
              <li><Link to="/news" className="text-gray-600 hover:text-gray-900">News & Blog</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 2: Customer Service */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-gray-600 hover:text-gray-900">Help & FAQ</Link></li>
              <li><Link to="/shipping" className="text-gray-600 hover:text-gray-900">Shipping & Delivery</Link></li>
              <li><Link to="/returns" className="text-gray-600 hover:text-gray-900">Returns & Exchanges</Link></li>
              <li><Link to="/order-tracking" className="text-gray-600 hover:text-gray-900">Order Tracking</Link></li>
            </ul>
          </div>

          {/* Column 3: Business */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Business</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => openAuthModal('login', 'supplier')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Supplier Login
                </button>
              </li>
              {/* <li>
                <button 
                  onClick={() => openAuthModal('register', 'supplier')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Become a Supplier
                </button>
              </li> */}
              <li>
                <button 
                  onClick={() => openAuthModal('login', 'admin')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Admin Login
                </button>
              </li>
              <li><Link to="/affiliate" className="text-gray-600 hover:text-gray-900">Affiliate Program</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-600 hover:text-gray-900">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="text-gray-600 hover:text-gray-900">Cookie Policy</Link></li>
              <li><Link to="/accessibility" className="text-gray-600 hover:text-gray-900">Accessibility</Link></li>
            </ul>
          </div>
        </div>

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