import React from 'react';
import { PriceRange } from '../../types/ProductTypes';

interface PriceRangeFilterProps {
  priceRange: PriceRange;
  onPriceRangeChange: (min: number, max: number | null) => void;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  priceRange,
  onPriceRangeChange,
}) => {
  return (
    <>
      <div className="space-y-3">
        <button 
          className={`block w-full text-left px-3 py-2 rounded-md text-sm ${priceRange.min === 0 && priceRange.max === null ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
          onClick={() => onPriceRangeChange(0, null)}
        >
          All Prices
        </button>
        <button 
          className={`block w-full text-left px-3 py-2 rounded-md text-sm ${priceRange.min === 0 && priceRange.max === 10000 ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
          onClick={() => onPriceRangeChange(0, 10000)}
        >
          Under Rwf 10,000
        </button>
        <button 
          className={`block w-full text-left px-3 py-2 rounded-md text-sm ${priceRange.min === 10000 && priceRange.max === 50000 ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
          onClick={() => onPriceRangeChange(10000, 50000)}
        >
          Rwf 10,000 - Rwf 50,000
        </button>
        <button 
          className={`block w-full text-left px-3 py-2 rounded-md text-sm ${priceRange.min === 50000 && priceRange.max === 100000 ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
          onClick={() => onPriceRangeChange(50000, 100000)}
        >
          Rwf 50,000 - Rwf 100,000
        </button>
        <button 
          className={`block w-full text-left px-3 py-2 rounded-md text-sm ${priceRange.min === 100000 && priceRange.max === null ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
          onClick={() => onPriceRangeChange(100000, null)}
        >
          Over Rwf 100,000
        </button>
      </div>

      {/* Custom price range */}
      <div className="mt-4 space-y-3">
        <p className="text-sm text-gray-700 mb-2">Custom Range</p>
        <div className="flex items-center space-x-2">
          <input 
            type="number" 
            placeholder="Min"
            min="0"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            onChange={e => {
              const min = e.target.value ? parseInt(e.target.value) : 0;
              onPriceRangeChange(min, priceRange.max);
            }}
            value={priceRange.min || ''}
          />
          <span className="text-gray-500">-</span>
          <input 
            type="number" 
            placeholder="Max"
            min="0"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            onChange={e => {
              const max = e.target.value ? parseInt(e.target.value) : null;
              onPriceRangeChange(priceRange.min, max);
            }}
            value={priceRange.max || ''}
          />
        </div>
      </div>
    </>
  );
};

export default PriceRangeFilter;