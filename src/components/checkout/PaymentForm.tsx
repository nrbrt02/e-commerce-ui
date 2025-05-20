import React, { useState, useEffect } from "react";
import { useCheckout } from "../../context/CheckoutContenxt";
import PaymentMethods from "./PaymentMethods";
import PayPalPayment from "./PayPalPayment";
import CreditCardForm from "./CreditCardForm";
import { PaymentStatus } from "../../context/CheckoutContenxt";
import orderApi from "../../utils/orderApi";
import { showToast } from '../ui/ToastProvider';

const PAYPAL_CLIENT_ID =
  "AYSq3RDGsmBLJE-otTkBtM-jBRd1TCQwFf9RGfwddNXWz0uFU9ztymylOhRS";

const PaymentForm: React.FC = () => {
  const {
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    paymentDetails,
    setPaymentDetails,
    draftOrder,
    updateDraftOrder,
    errors,
    handlePaymentCompletion,
    setErrors,
    paymentStatus,
    setPaymentStatus,
    goToNextStep,
    paymentMethods,
    handleCheckboxChange,
    isProcessingOrder,
    paymentData,
    handlePaymentChange,
  } = useCheckout();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handleSelectMethod = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setPaymentCompleted(false);
    updateDraftOrder({
      paymentMethod: methodId,
      paymentStatus: "pending" as PaymentStatus,
    });
    showToast.info(`Selected payment method: ${methodId}`);
  };

  const handlePayPalSuccess = async (details: any) => {
    console.log("Payment succeeded with PayPal:", details);
    setIsProcessing(true);

    try {
      const paymentInfo = {
        transactionId: details.id,
        payerId: details.payer.payer_id,
        payerEmail: details.payer.email_address,
        amount: details.purchase_units[0].amount.value,
        currency: details.purchase_units[0].amount.currency_code,
        status: details.status,
        createTime: details.create_time,
        updateTime: details.update_time,
      };

      // Save to localStorage immediately
      localStorage.setItem(
        "paypal_payment_response",
        JSON.stringify(paymentInfo)
      );

      // Update state
      setPaymentDetails(paymentInfo);
      setPaymentStatus("paid");
      setPaymentCompleted(true);

      const draftOrderId = localStorage.getItem("checkoutDraftOrderId");
      if (!draftOrderId) {
        throw new Error("No draft order ID found");
      }

      // Update the draft order with payment details
      const updateData = {
        paymentMethod: "paypal",
        paymentDetails: paymentInfo,
        paymentStatus: "paid" as PaymentStatus,
      };

      // This will make the PUT request to update the order
      const updatedDraft = await orderApi.updateDraftOrder(
        draftOrderId,
        updateData
      );
      console.log("Draft order updated with PayPal payment:", updatedDraft);

      // Proceed to next step
      goToNextStep();
    } catch (error) {
      console.error("Error processing PayPal payment:", error);
      setPaymentStatus("failed");
      setErrors(["Failed to process payment. Please try again."]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalError = (error: any) => {
    console.error("Payment failed with PayPal:", error);
    setIsProcessing(false);
    setPaymentStatus("failed" as PaymentStatus);
    updateDraftOrder({
      paymentStatus: "failed" as PaymentStatus,
    });
  };

  const handlePayPalCancel = () => {
    console.log("Payment cancelled by user");
    setIsProcessing(false);
    setPaymentStatus("cancelled" as PaymentStatus);
    updateDraftOrder({
      paymentStatus: "cancelled" as PaymentStatus,
    });
  };

  const handleCreditCardSubmit = async (cardData: any) => {
    setIsProcessing(true);

    setTimeout(async () => {
      const paymentInfo = {
        cardType: cardData.cardType,
        lastFour: cardData.cardNumber.slice(-4),
        expiryDate: `${cardData.expiryMonth}/${cardData.expiryYear}`,
        status: "authorized",
      };

      setPaymentDetails(paymentInfo);
      setPaymentStatus("authorized");

      await updateDraftOrder({
        paymentMethod: "credit_card",
        paymentDetails: paymentInfo,
        paymentStatus: "authorized",
      });

      setIsProcessing(false);
      setPaymentCompleted(true);

      setTimeout(() => {
        goToNextStep();
      }, 1000);
    }, 2000);
  };

  useEffect(() => {
    const checkPaymentStatus = () => {
      if (
        (paymentStatus === "paid" || paymentStatus === "authorized") &&
        selectedPaymentMethod &&
        paymentDetails
      ) {
        setPaymentCompleted(true);
      }
    };

    checkPaymentStatus();
  }, [paymentStatus, selectedPaymentMethod, paymentDetails]);

  useEffect(() => {
    if (paymentCompleted) {
      console.log("Payment completed, proceeding to next step...");
    }
  }, [paymentCompleted]);

  useEffect(() => {
    if (draftOrder) {
      if (draftOrder.paymentMethod) {
        setSelectedPaymentMethod(draftOrder.paymentMethod);
      }
      if (draftOrder.paymentDetails) {
        // Update form fields with draft order payment details
        Object.entries(draftOrder.paymentDetails).forEach(([key, value]) => {
          const event = {
            target: {
              name: key,
              value: value
            }
          } as React.ChangeEvent<HTMLInputElement>;
          handlePaymentChange(event);
        });
      }
    }
  }, [draftOrder]);

  const hasPaymentErrors = errors.some(
    (error) =>
      error.includes("payment") ||
      error.includes("PayPal") ||
      error.includes("card")
  );

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => handleSelectMethod(method.id)}
              className={`relative flex items-center p-4 border rounded-lg ${
                selectedPaymentMethod === method.id
                  ? 'border-sky-600 bg-sky-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center">
                <i className={`fas ${method.icon} text-xl mr-3 ${
                  selectedPaymentMethod === method.id ? 'text-sky-600' : 'text-gray-500'
                }`}></i>
                <span className="text-sm font-medium text-gray-900">
                  {method.name}
                </span>
              </div>
              {selectedPaymentMethod === method.id && (
                <div className="absolute top-2 right-2">
                  <i className="fas fa-check-circle text-sky-600"></i>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      {selectedPaymentMethod === 'card' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Card Details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={paymentData.cardNumber}
                onChange={handlePaymentChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            <div>
              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                Name on Card
              </label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                value={paymentData.cardName}
                onChange={handlePaymentChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={paymentData.expiryDate}
                  onChange={handlePaymentChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                  CVV
                </label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={paymentData.cvv}
                  onChange={handlePaymentChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="123"
                  required
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="saveCard"
                  name="saveCard"
                  checked={paymentData.saveCard}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="saveCard" className="ml-2 block text-sm text-gray-700">
                  Save card for future purchases
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPaymentMethod === 'paypal' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">PayPal Payment</h3>
          <PayPalPayment
            clientId={PAYPAL_CLIENT_ID}
            amount={draftOrder?.total || 0}
            itemCount={draftOrder?.items?.length || 0}
            onSuccess={handlePayPalSuccess}
            onError={handlePayPalError}
            onCancel={handlePayPalCancel}
          />
        </div>
      )}

      {selectedPaymentMethod === 'mobilemoney' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Mobile Money</h3>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={paymentData.phone}
              onChange={handlePaymentChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="+250 7XX XXX XXX"
              required
            />
          </div>
        </div>
      )}

      {selectedPaymentMethod === 'cod' && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            You will pay in cash when your order is delivered.
          </p>
        </div>
      )}

      {isProcessingOrder && (
        <div className="p-4 bg-blue-50 text-blue-600 rounded-lg">
          Processing your payment...
        </div>
      )}

      {hasPaymentErrors && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p className="font-medium mb-1">Please fix the following issues:</p>
          <ul className="list-disc pl-5">
            {errors
              .filter(
                (error) =>
                  error.includes("payment") ||
                  error.includes("PayPal") ||
                  error.includes("card")
              )
              .map((error, index) => (
                <li key={index}>{error}</li>
              ))}
          </ul>
        </div>
      )}

      {paymentDetails && (
        <div
          className={`mt-4 p-3 rounded-md ${
            paymentStatus === "paid" || paymentStatus === "authorized"
              ? "bg-green-50 text-green-800 border border-green-200"
              : paymentStatus === "failed"
              ? "bg-red-50 text-red-800 border border-red-200"
              : paymentStatus === "cancelled"
              ? "bg-gray-50 text-gray-800 border border-gray-200"
              : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          <div className="flex items-center">
            <i
              className={`fas ${
                paymentStatus === "paid" || paymentStatus === "authorized"
                  ? "fa-check-circle text-green-500"
                  : paymentStatus === "failed"
                  ? "fa-times-circle text-red-500"
                  : paymentStatus === "cancelled"
                  ? "fa-ban text-gray-500"
                  : "fa-info-circle text-blue-500"
              } mr-2`}
            ></i>
            <span>
              {paymentStatus === "paid"
                ? "Payment completed successfully!"
                : paymentStatus === "authorized"
                ? "Payment authorized successfully!"
                : paymentStatus === "failed"
                ? "Payment failed. Please try again."
                : paymentStatus === "cancelled"
                ? "Payment was cancelled."
                : "Payment is being processed."}
            </span>
          </div>

          {(paymentStatus === "paid" || paymentStatus === "authorized") &&
            paymentCompleted && (
              <div className="mt-2 text-green-700 font-medium">
                <p>Proceeding to order review...</p>
              </div>
            )}
        </div>
      )}

      {(selectedPaymentMethod === "bank_transfer" ||
        selectedPaymentMethod === "cash_on_delivery") && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => goToNextStep()}
            className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors duration-200"
          >
            Continue to Review
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
