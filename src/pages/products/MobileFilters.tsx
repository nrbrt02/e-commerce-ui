import React from 'react';
import { ProductCategory, PriceRange } from '../../types/ProductTypes';

interface MobileFiltersProps {
  categories: ProductCategory[];
  currentCategorySlug: string | null;
  priceRange: PriceRange;
  showInStock: boolean;
  onCategoryChange: (categorySlug: string | null) => void;
  onPriceRangeChange: (min: number, max: number | null) => void;
  onInStockChange: (checked: boolean) => void;
}

const MobileFilters: React.FC<MobileFiltersProps> = ({
  categories,
  currentCategorySlug,
  priceRange,
  showInStock,
  onCategoryChange,
  onPriceRangeChange,
  onInStockChange,
}) => {
  return (
    <div className="flex lg:hidden mb-4 overflow-x-auto pb-2 -mx-4 px-4 space-x-2">
      {/* Mobile category filter */}
      <div className="relative">
        <select
          value={currentCategorySlug || ''}
          onChange={e => onCategoryChange(e.target.value || null)}
          className="block appearance-none bg-white border border-gray-300 hover:border-sky-500 px-4 py-2 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Mobile price filter */}
      <div className="relative">
        <select
          value={`${priceRange.min}-${priceRange.max}`}
          onChange={e => {
            const value = e.target.value;
            if (value === 'all') {
              onPriceRangeChange(0, null);
            } else {
              const [min, max] = value.split('-').map(v => v === 'null' ? null : parseInt(v));
              onPriceRangeChange(min || 0, max);
            }
          }}
          className="block appearance-none bg-white border border-gray-300 hover:border-sky-500 px-4 py-2 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm"
        >
          <option value="all">All Prices</option>
          <option value="0-10000">Under Rwf 10,000</option>
          <option value="10000-50000">Rwf 10,000 - Rwf 50,000</option>
          <option value="50000-100000">Rwf 50,000 - Rwf 100,000</option>
          <option value="100000-null">Over Rwf 100,000</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Mobile in stock filter */}
      <button
        className={`px-4 py-2 rounded-md text-sm ${
          showInStock 
            ? 'bg-sky-500 text-white' 
            : 'bg-white border border-gray-300 text-gray-700'
        }`}
        onClick={() => onInStockChange(!showInStock)}
      >
        In Stock
      </button>
    </div>
  );
};

export default MobileFilters;