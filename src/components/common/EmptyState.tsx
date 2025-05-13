import React from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionText,
  actionLink,
  onAction,
  className = '',
}) => {
  // Map icon names to Font Awesome classes
  const iconMap: Record<string, string> = {
    search: 'fas fa-search',
    cart: 'fas fa-shopping-cart',
    order: 'fas fa-shopping-bag',
    wishlist: 'fas fa-heart',
    product: 'fas fa-box',
    user: 'fas fa-user',
    error: 'fas fa-exclamation-circle',
  };

  const iconClass = iconMap[icon] || 'fas fa-info-circle';

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 text-gray-500 mb-4">
        <i className={`${iconClass} text-2xl`}></i>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mx-auto mb-6">{message}</p>
      
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
        >
          {actionText}
        </Link>
      )}
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;