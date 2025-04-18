import React from 'react';
import { Link } from 'react-router-dom';

interface Category {
  id: number;
  name: string;
  icon: string;
  isActive?: boolean;
}

interface CategoryGridProps {
  title: string;
  highlightedText: string;
  categories: Category[];
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ title, highlightedText, categories }) => {
  return (
    <div>
      {/* Section Title */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {title} <span className="text-sky-600">{highlightedText}</span>
        </h2>
        <Link to="/categories" className="text-sky-600 hover:text-sky-700 font-medium flex items-center">
          View All
          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {categories.map((category) => (
          <Link 
            key={category.id}
            to={`/category/${category.name.toLowerCase()}`}
            className={`flex flex-col items-center justify-center p-4 rounded-lg text-center transition-all duration-300 ${
              category.isActive 
                ? 'bg-sky-600 text-white shadow-md' 
                : 'bg-white text-sky-800 hover:bg-sky-50 shadow-sm hover:shadow-md'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
              category.isActive ? 'bg-sky-500' : 'bg-sky-100'
            }`}>
              <img src={category.icon} alt={category.name} className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;