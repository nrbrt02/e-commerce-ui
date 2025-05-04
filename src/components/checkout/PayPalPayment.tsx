import React, { useEffect } from 'react';

interface PayPalPaymentProps {
  clientId: string;
  amount: number;
  itemCount: number;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalPayment: React.FC<PayPalPaymentProps> = ({
  clientId,
  amount,
  itemCount,
  onSuccess,
  onError,
  onCancel
}) => {
  useEffect(() => {
    // Only load PayPal script if it's not already loaded
    if (window.paypal) {
      renderPayPalButton();
      return;
    }
    
    // Add PayPal SDK script
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.async = true;
    script.onload = () => {
      renderPayPalButton();
    };
    script.onerror = () => {
      console.error('Failed to load PayPal SDK');
      onError(new Error('Failed to load PayPal SDK'));
    };
    
    document.body.appendChild(script);
    
    // Cleanup
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [clientId, amount]);
  
  const renderPayPalButton = () => {
    if (!window.paypal) return;
    
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    if (!paypalButtonContainer || paypalButtonContainer.children.length > 0) return;
    
    window.paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            description: `Your purchase (${itemCount} items)`,
            amount: {
              currency_code: 'USD',
              value: (amount / 100).toFixed(2), // Convert from cents to dollars
            }
          }]
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          console.log('PayPal payment successful:', details);
          onSuccess(details);
        });
      },
      onError: (err: any) => {
        console.error('PayPal payment error:', err);
        onError(err);
      },
      onCancel: () => {
        console.log('PayPal payment cancelled');
        onCancel();
      }
    }).render('#paypal-button-container');
  };
  
  return (
    <div className="mt-4 border border-gray-200 rounded-md p-4 bg-gray-50">
      <div className="text-center mb-4">
        <p className="text-gray-700 mb-2">Click the PayPal button below to complete your payment</p>
        <p className="text-sm text-gray-500">You will be redirected to PayPal to complete your purchase securely.</p>
      </div>
      
      <div id="paypal-button-container" className="mt-4"></div>
      
      <div className="mt-6 text-xs text-gray-500 flex items-center justify-center">
        <i className="fas fa-lock mr-1"></i>
        <span>Secure payment processed by PayPal</span>
      </div>
    </div>
  );
};

export default PayPalPayment;