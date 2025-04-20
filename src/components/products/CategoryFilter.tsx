import React from 'react';

interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: ProductCategory[];
  currentCategory: string | null;
  onCategoryChange: (categorySlug: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  currentCategory,
  onCategoryChange
}) => {
  return (
    <div className="space-y-1">
      <button
        onClick={() => onCategoryChange(null)}
        className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
          !currentCategory
            ? 'bg-sky-50 text-sky-700 font-medium'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        All Categories
      </button>
      
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.slug)}
          className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
            currentCategory === category.slug
              ? 'bg-sky-50 text-sky-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;