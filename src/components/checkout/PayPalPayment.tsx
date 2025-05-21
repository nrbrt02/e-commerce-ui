import React, { useEffect, useState, useRef } from 'react';
import { useCheckout } from '../../context/CheckoutContenxt';
import { getPayPalAmount } from '../../utils/currencyUtils';
import { showToast } from '../ui/ToastProvider';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalPaymentProps {
  clientId: string;
  amount: number;
  itemCount: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

const PayPalPayment: React.FC<PayPalPaymentProps> = ({
  clientId,
  amount,
  itemCount,
  onSuccess,
  onError,
  onCancel
}) => {
  const {
    totalOrderAmount,
    handlePaymentCompletion,
    convertedAmount,
    isProcessingOrder,
    draftOrder,
    updateDraftOrder,
    setPaymentStatus,
    setPaymentDetails
  } = useCheckout();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const paypalButtonContainerRef = useRef<HTMLDivElement>(null);
  const paypalButtonsRef = useRef<any>(null);

  useEffect(() => {
    const loadPayPalScript = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Remove any existing PayPal script
        const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
        if (existingScript) {
          existingScript.remove();
        }

        // Load PayPal script
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
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
          script.remove();
        };
      } catch (err) {
        setError('Failed to initialize PayPal. Please try again.');
        setIsLoading(false);
      }
    };

    loadPayPalScript();
  }, [clientId]);

  useEffect(() => {
    if (window.paypal && !isLoading && paypalButtonContainerRef.current) {
      // Clear previous buttons
      if (paypalButtonsRef.current) {
        paypalButtonsRef.current.close();
      }
      
      // Create new buttons
      paypalButtonsRef.current = window.paypal.Buttons({
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

            // Update draft order with pending payment status
            if (draftOrder?.id) {
              await updateDraftOrder({
                paymentStatus: 'pending',
                paymentMethod: 'paypal',
                lastUpdated: new Date().toISOString()
              });
            }

            // Create a clean description
            const description = `Order #${draftOrder?.orderNumber || 'DRAFT'} - ${itemCount} item${itemCount > 1 ? 's' : ''}`;

            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    currency_code: 'USD',
                    value: amount.toFixed(2),
                  },
                  description: description,
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
            
            // Validate order data
            if (!order || !order.id || !order.payer || !order.purchase_units?.[0]?.amount) {
              throw new Error('Invalid PayPal order response');
            }
            
            // Prepare payment details with validation
            const paymentInfo = {
              transactionId: order.id,
              payerId: order.payer.payer_id,
              payerEmail: order.payer.email_address,
              amount: order.purchase_units[0].amount.value,
              currency: order.purchase_units[0].amount.currency_code,
              status: order.status,
              createTime: order.create_time,
              updateTime: order.update_time,
              paymentMethod: 'paypal',
              paymentProvider: 'paypal',
              paymentType: 'online',
              paymentStatus: 'COMPLETED'
            };

            // Validate payment info
            if (!paymentInfo.transactionId || !paymentInfo.payerId || !paymentInfo.amount) {
              throw new Error('Invalid payment information');
            }

            // Save to localStorage with timestamp
            const storageData = {
              ...paymentInfo,
              storedAt: new Date().toISOString()
            };
            localStorage.setItem('paypal_payment_response', JSON.stringify(storageData));

            // Update state
            setPaymentDetails(paymentInfo);
            setPaymentStatus('paid');

            // Update draft order with validated payment info
            if (draftOrder?.id) {
              try {
                await updateDraftOrder({
                  paymentStatus: 'paid',
                  paymentMethod: 'paypal',
                  paymentDetails: paymentInfo,
                  status: 'processing',
                  lastUpdated: new Date().toISOString()
                });
              } catch (updateError) {
                console.error('Error updating draft order:', updateError);
                // Continue with payment process even if draft update fails
              }
            }
            
            // Handle successful payment
            const success = await handlePaymentCompletion(
              paymentInfo,
              'paid',
              'paypal'
            );

            if (success) {
              showToast.success('Payment completed successfully!');
              if (onSuccess) onSuccess();
            } else {
              showToast.error('Failed to process payment. Please try again.');
              if (onError) onError(new Error('Payment processing failed'));
            }
          } catch (err) {
            console.error('PayPal payment error:', err);
            showToast.error('Payment failed. Please try again.');
            if (onError) onError(err);
            throw err;
          }
        },
        onError: (err: any) => {
          showToast.error('Payment failed. Please try again.');
          if (onError) onError(err);
          console.error('PayPal error:', err);
        },
        onCancel: () => {
          showToast.info('Payment cancelled');
          if (onCancel) onCancel();
        }
      });

      // Render buttons
      paypalButtonsRef.current.render(paypalButtonContainerRef.current);
    }

    // Cleanup function
    return () => {
      if (paypalButtonsRef.current) {
        paypalButtonsRef.current.close();
      }
    };
  }, [isLoading, totalOrderAmount, handlePaymentCompletion, draftOrder, updateDraftOrder, itemCount, onSuccess, onError, onCancel]);

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
      
      <div ref={paypalButtonContainerRef} className="w-full" />
      
      {isProcessingOrder && (
        <div className="mt-4 p-4 bg-blue-50 text-blue-600 rounded-lg">
          Processing your payment...
        </div>
      )}
    </div>
  );
};

export default PayPalPayment;