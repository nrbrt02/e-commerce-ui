import React from 'react';

interface ProductCardProps {
  name: string;
  image: string;
  currentPrice: number;
  originalPrice: number;
  discount: number;
  savings: number;
  currency?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  image,
  currentPrice,
  originalPrice,
  discount,
  savings,
  currency = 'Rwf '
}) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
      <div className="relative">
        <div className="absolute top-0 right-0 bg-sky-500 text-white text-xs font-bold px-2 py-1 rounded-tl-lg">
          {discount}% OFF
        </div>
        <div className="flex justify-center">
          <img src={image} alt={name} className="h-32 object-contain" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium">{name}</h3>
        <div className="flex mt-1 items-baseline">
          <span className="text-sm font-bold">{currency}{currentPrice.toLocaleString()}</span>
          <span className="ml-2 text-xs text-gray-500 line-through">{currency}{originalPrice.toLocaleString()}</span>
        </div>
        <div className="mt-1 text-xs text-green-600 font-medium">
          Save: {currency}{savings.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;