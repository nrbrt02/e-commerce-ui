import React from 'react';
import { PaymentFormData } from '../../context/CheckoutContenxt';

interface CardPaymentFormProps {
  paymentData: PaymentFormData;
  isAuthenticated: boolean;
  onPaymentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CardPaymentForm: React.FC<CardPaymentFormProps> = ({
  paymentData,
  isAuthenticated,
  onPaymentChange,
  onCheckboxChange
}) => {
  return (
    <div className="mt-4 border border-gray-200 rounded-md p-4 bg-gray-50">
      <div className="space-y-4">
        <div>
          <label htmlFor="cardNumber" className="block text-gray-700 text-sm font-medium mb-2">
            Card Number *
          </label>
          <div className="relative">
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={paymentData.cardNumber}
              onChange={onPaymentChange}
              placeholder="1234 5678 9012 3456"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 pl-10"
              maxLength={19}
              required
            />
            <i className="fas fa-credit-card absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            We accept Visa, Mastercard, American Express, and Discover
          </p>
        </div>
        
        <div>
          <label htmlFor="cardName" className="block text-gray-700 text-sm font-medium mb-2">
            Cardholder Name *
          </label>
          <input
            type="text"
            id="cardName"
            name="cardName"
            value={paymentData.cardName}
            onChange={onPaymentChange}
            placeholder="Name as shown on card"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiryDate" className="block text-gray-700 text-sm font-medium mb-2">
              Expiry Date *
            </label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              value={paymentData.expiryDate}
              onChange={onPaymentChange}
              placeholder="MM/YY"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              maxLength={5}
              required
            />
          </div>
          
          <div>
            <label htmlFor="cvv" className="block text-gray-700 text-sm font-medium mb-2">
              CVV *
            </label>
            <div className="relative">
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={paymentData.cvv}
                onChange={onPaymentChange}
                placeholder="123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                maxLength={4}
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <i className="fas fa-question-circle text-gray-400 cursor-help"
                  title="3-4 digit security code on the back of your card"></i>
              </div>
            </div>
          </div>
        </div>
        
        {/* Save card option for authenticated users */}
        {isAuthenticated && (
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="payment.saveCard"
                checked={paymentData.saveCard}
                onChange={onCheckboxChange}
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">Save this card for future payments</span>
            </label>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 flex items-center">
        <i className="fas fa-lock mr-1"></i>
        <span>Your payment information is secure</span>
      </div>
    </div>
  );
};

export default CardPaymentForm;