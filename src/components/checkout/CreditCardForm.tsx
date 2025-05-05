import React, { useState } from 'react';

interface CreditCardFormProps {
  onSubmit: (cardData: any) => void;
  isProcessing: boolean;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({
  onSubmit,
  isProcessing
}) => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardType: 'unknown'
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Detect card type based on first digits
  const detectCardType = (cardNumber: string) => {
    const cleanedNumber = cardNumber.replace(/\s+/g, '');
    let cardType = 'unknown';
    
    // Visa
    if (/^4/.test(cleanedNumber)) {
      cardType = 'visa';
    }
    // Mastercard
    else if (/^5[1-5]/.test(cleanedNumber)) {
      cardType = 'mastercard';
    }
    // Amex
    else if (/^3[47]/.test(cleanedNumber)) {
      cardType = 'amex';
    }
    // Discover
    else if (/^6(?:011|5)/.test(cleanedNumber)) {
      cardType = 'discover';
    }
    
    return cardType;
  };
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleanedValue = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const cardType = detectCardType(cleanedValue);
    
    let formatted = '';
    if (cardType === 'amex') {
      // Format: XXXX XXXXXX XXXXX
      for (let i = 0; i < cleanedValue.length && i < 15; i++) {
        if (i === 4 || i === 10) {
          formatted += ' ';
        }
        formatted += cleanedValue[i];
      }
    } else {
      // Format: XXXX XXXX XXXX XXXX
      for (let i = 0; i < cleanedValue.length && i < 16; i++) {
        if (i > 0 && i % 4 === 0) {
          formatted += ' ';
        }
        formatted += cleanedValue[i];
      }
    }
    
    return formatted;
  };
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    const cardType = detectCardType(formattedValue);
    setCardData({
      ...cardData,
      cardNumber: formattedValue,
      cardType
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCardData({
      ...cardData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate card number
    const cleanCardNumber = cardData.cardNumber.replace(/\s+/g, '');
    if (!cleanCardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if ((cardData.cardType === 'amex' && cleanCardNumber.length !== 15) || 
               (cardData.cardType !== 'amex' && cleanCardNumber.length !== 16)) {
      newErrors.cardNumber = 'Invalid card number length';
    }
    
    // Validate cardholder name
    if (!cardData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    // Validate expiry date
    if (!cardData.expiryMonth) {
      newErrors.expiryMonth = 'Expiry month is required';
    }
    
    if (!cardData.expiryYear) {
      newErrors.expiryYear = 'Expiry year is required';
    }
    
    // Validate current date
    if (cardData.expiryMonth && cardData.expiryYear) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      const expiryYear = parseInt(cardData.expiryYear);
      const expiryMonth = parseInt(cardData.expiryMonth);
      
      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }
    
    // Validate CVV
    if (!cardData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if ((cardData.cardType === 'amex' && cardData.cvv.length !== 4) || 
               (cardData.cardType !== 'amex' && cardData.cvv.length !== 3)) {
      newErrors.cvv = 'Invalid CVV length';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(cardData);
    }
  };
  
  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear + i);
  
  // Get card type icon
  const getCardIcon = () => {
    switch (cardData.cardType) {
      case 'visa':
        return 'fa-cc-visa';
      case 'mastercard':
        return 'fa-cc-mastercard';
      case 'amex':
        return 'fa-cc-amex';
      case 'discover':
        return 'fa-cc-discover';
      default:
        return 'fa-credit-card';
    }
  };
  
  return (
    <div className="mt-4 border border-gray-200 rounded-md p-4 bg-gray-50">
      <form onSubmit={handleSubmit}>
        {/* Card number */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              name="cardNumber"
              value={cardData.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              className={`w-full px-4 py-2 border rounded-md ${
                errors.cardNumber ? 'border-red-300' : 'border-gray-300'
              } focus:outline-none focus:ring-1 focus:ring-sky-500`}
              maxLength={19}
              disabled={isProcessing}
            />
            {cardData.cardNumber && (
              <div className="absolute right-3 top-2 text-gray-400">
                <i className={`fab ${getCardIcon()}`}></i>
              </div>
            )}
          </div>
          {errors.cardNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>
          )}
        </div>
        
        {/* Cardholder name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            name="cardholderName"
            value={cardData.cardholderName}
            onChange={handleInputChange}
            placeholder="John Doe"
            className={`w-full px-4 py-2 border rounded-md ${
              errors.cardholderName ? 'border-red-300' : 'border-gray-300'
            } focus:outline-none focus:ring-1 focus:ring-sky-500`}
            disabled={isProcessing}
          />
          {errors.cardholderName && (
            <p className="mt-1 text-xs text-red-600">{errors.cardholderName}</p>
          )}
        </div>
        
        {/* Expiry date and CVV */}
        <div className="flex flex-wrap -mx-2 mb-4">
          <div className="w-1/2 px-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <div className="flex space-x-2">
              <select
                name="expiryMonth"
                value={cardData.expiryMonth}
                onChange={handleInputChange}
                className={`w-1/2 px-2 py-2 border rounded-md ${
                  errors.expiryMonth ? 'border-red-300' : 'border-gray-300'
                } focus:outline-none focus:ring-1 focus:ring-sky-500`}
                disabled={isProcessing}
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month.toString().padStart(2, '0')}>
                    {month.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <select
                name="expiryYear"
                value={cardData.expiryYear}
                onChange={handleInputChange}
                className={`w-1/2 px-2 py-2 border rounded-md ${
                  errors.expiryYear ? 'border-red-300' : 'border-gray-300'
                } focus:outline-none focus:ring-1 focus:ring-sky-500`}
                disabled={isProcessing}
              >
                <option value="">YYYY</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            {(errors.expiryMonth || errors.expiryYear || errors.expiryDate) && (
              <p className="mt-1 text-xs text-red-600">
                {errors.expiryDate || errors.expiryMonth || errors.expiryYear}
              </p>
            )}
          </div>
          <div className="w-1/2 px-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="password"
              name="cvv"
              value={cardData.cvv}
              onChange={handleInputChange}
              placeholder={cardData.cardType === 'amex' ? '4 digits' : '3 digits'}
              maxLength={cardData.cardType === 'amex' ? 4 : 3}
              className={`w-full px-4 py-2 border rounded-md ${
                errors.cvv ? 'border-red-300' : 'border-gray-300'
              } focus:outline-none focus:ring-1 focus:ring-sky-500`}
              disabled={isProcessing}
            />
            {errors.cvv && (
              <p className="mt-1 text-xs text-red-600">{errors.cvv}</p>
            )}
          </div>
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:bg-gray-400"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="inline-block animate-spin mr-2">
                <i className="fas fa-circle-notch"></i>
              </span>
              Processing...
            </>
          ) : (
            'Pay Now'
          )}
        </button>
        
        {/* Secure payment message */}
        <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center">
          <i className="fas fa-lock mr-1"></i>
          <span>Your payment information is secure</span>
        </div>
      </form>
    </div>
  );
};

export default CreditCardForm;