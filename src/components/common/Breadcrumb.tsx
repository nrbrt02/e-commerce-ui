import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center text-sm text-gray-500 mb-4 ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && (
            <span className="mx-2">
              <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
            </span>
          )}
          
          {index === items.length - 1 ? (
            <span className="font-medium text-gray-700">{item.label}</span>
          ) : (
            <Link 
              to={item.path} 
              className="hover:text-sky-600 hover:underline transition-colors"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;