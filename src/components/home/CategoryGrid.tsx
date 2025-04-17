import React from 'react';
import CategoryCard from '../ui/CategoryCard';

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

const CategoryGrid: React.FC<CategoryGridProps> = ({ 
  title = "Shop by", 
  highlightedText = "Category", 
  categories = [
    { id: 1, name: 'Smartphones', icon: 'fas fa-mobile-alt', isActive: true },
    { id: 2, name: 'Laptops', icon: 'fas fa-laptop' },
    { id: 3, name: 'Watches', icon: 'fas fa-clock' },
    { id: 4, name: 'Headphones', icon: 'fas fa-headphones' },
    { id: 5, name: 'Cameras', icon: 'fas fa-camera' },
    { id: 6, name: 'Gaming', icon: 'fas fa-gamepad' },
    { id: 7, name: 'Accessories', icon: 'fas fa-plug' },
    { id: 8, name: 'TV & Audio', icon: 'fas fa-tv' },
    { id: 9, name: 'Appliances', icon: 'fas fa-blender' },
    { id: 10, name: 'Tablets', icon: 'fas fa-tablet-alt' },
    { id: 11, name: 'More', icon: 'fas fa-ellipsis-h' }
  ]
}) => {
  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {title} <span className="text-sky-600">{highlightedText}</span>
        </h2>
        <a href="#" className="text-sm text-sky-600 hover:text-sky-800 transition-colors duration-200 flex items-center font-medium">
          View All <i className="fas fa-chevron-right ml-1 text-xs"></i>
        </a>
      </div>
      <div className="border-b-2 border-sky-500 w-40 mb-6"></div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-11 gap-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            name={category.name}
            icon={category.icon}
            isActive={category.isActive}
          />
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;