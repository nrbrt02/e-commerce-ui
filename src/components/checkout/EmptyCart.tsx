import React from 'react';
import { Link } from 'react-router-dom';

const EmptyCart: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-lg mx-auto">
        <div className="text-gray-400 text-6xl mb-6">
          <i className="fas fa-shopping-cart"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Your cart is empty
        </h1>
        <p className="text-gray-600 mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          to="/"
          className="bg-sky-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default EmptyCart;