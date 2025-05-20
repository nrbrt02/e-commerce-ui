import React, { useEffect, useState } from 'react';
import { useCheckout } from '../../context/CheckoutContenxt';
import { getPayPalAmount } from '../../utils/currencyUtils';
import { showToast } from '../ui/ToastProvider';

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalPayment: React.FC = () => {
  const {
    totalOrderAmount,
    handlePaymentCompletion,
    convertedAmount,
    isProcessingOrder,
  } = useCheckout();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayPalScript = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load PayPal script
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&currency=USD`;
        script.async = true;
        script.onload = () => {
          setIsLoading(false);
        };
        script.onerror = () => {
          setError('Failed to load PayPal. Please try again.');
          setIsLoading(false);
        };
        document.body.appendChild(script);

        return () => {
          document.body.removeChild(script);
        };
      } catch (err) {
        setError('Failed to initialize PayPal. Please try again.');
        setIsLoading(false);
      }
    };

    loadPayPalScript();
  }, []);

  useEffect(() => {
    if (window.paypal && !isLoading) {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'pay',
        },
        createOrder: async (data: any, actions: any) => {
          try {
            // Convert RWF to USD
            const { amount } = await getPayPalAmount(totalOrderAmount);

            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    currency_code: 'USD',
                    value: amount.toFixed(2),
                  },
                },
              ],
            });
          } catch (err) {
            showToast.error('Failed to create PayPal order. Please try again.');
            throw err;
          }
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const order = await actions.order.capture();
            
            // Handle successful payment
            const success = await handlePaymentCompletion(
              {
                transactionId: order.id,
                payerEmail: order.payer.email_address,
                status: order.status,
              },
              'paid',
              'paypal'
            );

            if (success) {
              showToast.success('Payment completed successfully!');
            } else {
              showToast.error('Failed to process payment. Please try again.');
            }
          } catch (err) {
            showToast.error('Payment failed. Please try again.');
            throw err;
          }
        },
        onError: (err: any) => {
          showToast.error('Payment failed. Please try again.');
          console.error('PayPal error:', err);
        },
      }).render('#paypal-button-container');
    }
  }, [isLoading, totalOrderAmount, handlePaymentCompletion]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {convertedAmount && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Amount in USD: {convertedAmount.formattedAmount}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Exchange rate is updated automatically
          </p>
        </div>
      )}
      
      <div id="paypal-button-container" className="w-full" />
      
      {isProcessingOrder && (
        <div className="mt-4 p-4 bg-blue-50 text-blue-600 rounded-lg">
          Processing your payment...
        </div>
      )}
    </div>
  );
};

export default PayPalPayment;