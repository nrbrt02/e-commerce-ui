import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  ...rest
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    outline: 'border border-sky-600 text-sky-600 hover:bg-sky-50 focus:ring-sky-500',
    text: 'text-sky-600 hover:text-sky-700 hover:bg-sky-50 focus:ring-sky-500',
  };
  
  // Width class
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Disabled state
  const disabledClasses = rest.disabled ? 'opacity-60 cursor-not-allowed' : '';
  
  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${disabledClasses} ${className}`}
      {...rest}
    >
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </button>
  );
};

export default Button;