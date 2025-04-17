import React, { InputHTMLAttributes, useState } from 'react';

// Extending the InputHTMLAttributes to reuse all native input props
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  id,
  error,
  icon,
  containerClassName = '',
  className = '',
  type = 'text',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const inputType = type === 'password' && isPasswordVisible ? 'text' : type;

  return (
    <div className={`mb-4 ${containerClassName}`}>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      
      <div className={`relative rounded-lg border ${
        error 
          ? 'border-red-300 focus-within:ring-red-200 focus-within:border-red-400'
          : isFocused
            ? 'border-sky-300 ring-2 ring-sky-100'
            : 'border-gray-300 hover:border-sky-200'
      } transition-all duration-200`}>
        
        {/* Icon (if provided) */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {icon}
          </div>
        )}
        
        <input
          id={id}
          type={inputType}
          className={`block w-full py-2.5 ${
            icon ? 'pl-10' : 'pl-4'
          } ${
            type === 'password' ? 'pr-10' : 'pr-4'
          } rounded-lg bg-white focus:outline-none text-gray-700 ${className}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {/* Password visibility toggle */}
        {type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-sky-600"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? (
              <i className="fas fa-eye-slash"></i>
            ) : (
              <i className="fas fa-eye"></i>
            )}
          </button>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;