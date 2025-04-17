import React from 'react';

interface CategoryCardProps {
  name: string;
  icon: string;
  isActive?: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, icon, isActive = false }) => {
  return (
    <a href="#" className="text-center">
      <div className={`category-icon ${isActive ? 'bg-sky-100' : 'bg-gray-100'} w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto`}>
        <img src={icon} alt={name} className="w-8 h-8" />
      </div>
      <p className="mt-2 text-sm">{name}</p>
    </a>
  );
};

export default CategoryCard;