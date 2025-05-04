import React from 'react';
import { PaymentMethod } from '../../context/CheckoutContenxt';

interface PaymentMethodsProps {
  methods: PaymentMethod[];
  selectedMethod: string;
  onSelectMethod: (id: string) => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  methods,
  selectedMethod,
  onSelectMethod
}) => {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-md p-4 cursor-pointer transition-all text-center ${
              selectedMethod === method.id
                ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-50'
                : 'border-gray-200 hover:border-sky-200'
            }`}
            onClick={() => onSelectMethod(method.id)}
          >
            <i className={`fas ${method.icon} text-2xl mb-2 ${
              selectedMethod === method.id ? 'text-sky-600' : 'text-gray-500'
            }`}></i>
            <div className="text-sm font-medium">
              {method.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethods;