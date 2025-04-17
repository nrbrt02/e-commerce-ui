import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t">
      {/* Newsletter Subscription */}
      <div className="bg-sky-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-xl md:text-2xl font-semibold text-sky-800 mb-2">
              Subscribe to our Newsletter
            </h3>
            <p className="text-sky-700 mb-4">
              Get the latest updates on new products and upcoming sales
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2.5 rounded-l-md border border-gray-300 bg-white text-gray-800 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition w-full sm:w-auto"
              />
              <button className="bg-sky-600 text-white px-6 py-2.5 rounded-r-md hover:bg-sky-700 transition-colors duration-200 font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About section */}
            <div>
              <h4 className="text-lg font-semibold text-sky-800 mb-4">
                About Fast Shopping
              </h4>
              <p className="text-gray-600 mb-4">
                Fast Shopping is your one-stop destination for all your shopping
                needs with great deals, fast delivery and excellent customer
                service.
              </p>
              <div className="flex space-x-3">
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white hover:bg-sky-700 transition-colors duration-200"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white hover:bg-sky-700 transition-colors duration-200"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white hover:bg-sky-700 transition-colors duration-200"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white hover:bg-sky-700 transition-colors duration-200"
                >
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>

            {/* Information links */}
            <div>
              <h4 className="text-lg font-semibold text-sky-800 mb-4">
                Information
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-sky-600 transition-colors duration-200"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-sky-600 transition-colors duration-200"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-sky-600 transition-colors duration-200"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-sky-600 transition-colors duration-200"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-sky-600 transition-colors duration-200"
                  >
                    Returns & Refunds
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-sky-600 transition-colors duration-200"
                  >
                    Shipping & Delivery
                  </a>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-lg font-semibold text-sky-800 mb-4">
                Customer Service
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-sky-600 transition-colors duration-200"
                  >
                    My Account
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-sky-600 transition-colors duration-200"
                  >
                    Track Your Order
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-sky-600 transition-colors duration-200"
                  >
                    Wishlist
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-sky-600 transition-colors duration-200"
                  >
                    Shopping Cart
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-sky-600 transition-colors duration-200"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-sky-600 transition-colors duration-200"
                  >
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact information */}
            <div>
              <h4 className="text-lg font-semibold text-sky-800 mb-4">
                Contact Us
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <i className="fas fa-map-marker-alt text-sky-600 mt-1 mr-3"></i>
                  <span className="text-gray-600">
                    123 Shopping Street, Market City, 10001
                  </span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-phone-alt text-sky-600 mr-3"></i>
                  <span className="text-gray-600">+1 234 567 8901</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-envelope text-sky-600 mr-3"></i>
                  <span className="text-gray-600">
                    support@fastshopping.com
                  </span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-clock text-sky-600 mr-3"></i>
                  <span className="text-gray-600">24/7 Customer Support</span>
                </li>
              </ul>

              {/* Payment methods */}
              <div className="mt-6">
                <h5 className="text-sm font-medium text-gray-600 mb-2">
                  We Accept
                </h5>
                <div className="flex space-x-2">
                  <i className="fab fa-cc-visa text-2xl text-blue-700"></i>
                  <i className="fab fa-cc-mastercard text-2xl text-red-500"></i>
                  <i className="fab fa-cc-amex text-2xl text-blue-500"></i>
                  <i className="fab fa-cc-paypal text-2xl text-blue-800"></i>
                  <i className="fab fa-cc-apple-pay text-2xl text-gray-800"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom copyright bar */}
      <div className="bg-sky-900 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="mb-2 md:mb-0">
              &copy; {new Date().getFullYear()} Fast Shopping. All Rights
              Reserved.
            </div>
            <div className="text-sm">
              <span className="hidden sm:inline">Designed with </span>
              <i className="fas fa-heart text-red-500 mx-1"></i>
              <span> for a great shopping experience</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
