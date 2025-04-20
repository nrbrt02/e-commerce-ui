import React, { useEffect, useRef } from 'react';

// Define props interface
interface PayPalPaymentProps {
  amount: number;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

export const PayPalPayment: React.FC<PayPalPaymentProps> = ({ 
  amount, 
  onSuccess, 
  onError, 
  onCancel 
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  // Get PayPal client ID from environment variables in Vite
  // Note: In Vite, we use import.meta.env instead of process.env
  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb'; // 'sb' is sandbox mode client ID

  useEffect(() => {
    // Avoid loading the script multiple times
    if (scriptLoaded.current) return;
    
    const loadPayPalScript = async () => {
      scriptLoaded.current = true;
      
      // Load the PayPal SDK script
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;
      
      script.onload = () => {
        if (!paypalRef.current || !(window as any).paypal) return;
        
        // Initialize PayPal buttons
        (window as any).paypal
          .Buttons({
            createOrder: (_: any, actions: any) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: amount.toFixed(2),
                      currency_code: 'USD'
                    }
                  }
                ]
              });
            },
            onApprove: async (_: any, actions: any) => {
              try {
                const details = await actions.order.capture();
                onSuccess(details);
              } catch (error) {
                onError(error);
              }
            },
            onError: (error: any) => {
              onError(error);
            },
            onCancel: () => {
              onCancel();
            }
          })
          .render(paypalRef.current);
      };
      
      script.onerror = (error) => {
        console.error('Error loading PayPal script:', error);
        onError(new Error('Failed to load PayPal SDK'));
      };
      
      document.body.appendChild(script);
    };
    
    loadPayPalScript();
    
    // Cleanup
    return () => {
      // Remove the script when component unmounts if necessary
      const paypalScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (paypalScript) {
        document.body.removeChild(paypalScript);
      }
    };
  }, [amount, onSuccess, onError, onCancel, PAYPAL_CLIENT_ID]);
  
  return (
    <div>
      <div ref={paypalRef} className="mt-4"></div>
      <div className="text-sm text-gray-500 mt-2 text-center">
        Secure payment processing by PayPal
      </div>
    </div>
  );
};

export default PayPalPayment;