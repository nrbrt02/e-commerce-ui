import React from 'react';
import { ProductCategory, PriceRange } from '../../types/ProductTypes';
import CategoryFilter from '../../components/products/CategoryFilter';
import PriceRangeFilter from './PriceRangeFilter';


interface FilterSidebarProps {
  categories: ProductCategory[];
  currentCategorySlug: string | null;
  priceRange: PriceRange;
  showInStock: boolean;
  onCategoryChange: (categorySlug: string | null) => void;
  onPriceRangeChange: (min: number, max: number | null) => void;
  onInStockChange: (checked: boolean) => void;
  onClearFilters: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  currentCategorySlug,
  priceRange,
  showInStock,
  onCategoryChange,
  onPriceRangeChange,
  onInStockChange,
  onClearFilters,
}) => {
  return (
    <div className="space-y-6">
      {/* Categories filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
        <CategoryFilter 
          categories={categories}
          currentCategory={currentCategorySlug}
          onCategoryChange={onCategoryChange}
        />
      </div>

      {/* Price range filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Price Range</h3>
        <PriceRangeFilter 
          priceRange={priceRange}
          onPriceRangeChange={onPriceRangeChange}
        />
      </div>

      {/* Stock filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Availability</h3>
        <label className="flex items-center">
          <input 
            type="checkbox" 
            className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
            checked={showInStock}
            onChange={e => onInStockChange(e.target.checked)}
          />
          <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
        </label>
      </div>
      
      {/* Clear filters button */}
      <button 
        onClick={onClearFilters}
        className="w-full py-2 px-4 border border-sky-300 text-sky-700 rounded-md text-sm font-medium hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default FilterSidebar;