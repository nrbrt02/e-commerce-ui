import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  iconTextColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBgColor,
  iconTextColor,
  trend,
  subtitle
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          
          {/* Trend indicator */}
          {trend && (
            <div className="flex items-center mt-1">
              <span className={`text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'} font-medium flex items-center`}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-3 w-3 mr-1 ${trend.isPositive ? '' : 'transform rotate-180'}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M12 7a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 10.586V7z" 
                    clipRule="evenodd" 
                  />
                </svg>
                {trend.value}% {trend.label || (trend.isPositive ? 'increase' : 'decrease')}
              </span>
            </div>
          )}
          
          {/* Optional subtitle */}
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className={`rounded-full ${iconBgColor} p-3`}>
          <div className={`h-6 w-6 ${iconTextColor}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;