import React, { useState, useEffect } from "react";
import { useCheckout } from "../../context/CheckoutContenxt";
import PaymentMethods from "./PaymentMethods";
import PayPalPayment from "./PayPalPayment";
import CreditCardForm from "./CreditCardForm";
import { PaymentStatus } from "../../context/CheckoutContenxt";
import orderApi from "../../utils/orderApi";

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
  } = useCheckout();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const availablePaymentMethods = [
    {
      id: "paypal",
      name: "PayPal",
      icon: "fa-paypal",
    },
    {
      id: "credit_card",
      name: "Credit Card",
      icon: "fa-credit-card",
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      icon: "fa-university",
    },
    {
      id: "cash_on_delivery",
      name: "Cash on Delivery",
      icon: "fa-money-bill-wave",
    },
  ];

  const handleSelectMethod = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setPaymentCompleted(false);
    updateDraftOrder({
      paymentMethod: methodId,
      paymentStatus: "pending" as PaymentStatus,
    });
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

  const hasPaymentErrors = errors.some(
    (error) =>
      error.includes("payment") ||
      error.includes("PayPal") ||
      error.includes("card")
  );

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-xl font-medium text-gray-900 mb-4">Payment Method</h2>

      {hasPaymentErrors && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
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

      <PaymentMethods
        methods={availablePaymentMethods}
        selectedMethod={selectedPaymentMethod || ""}
        onSelectMethod={handleSelectMethod}
      />

      {selectedPaymentMethod === "paypal" && (
        <PayPalPayment
          clientId={PAYPAL_CLIENT_ID}
          amount={draftOrder?.total || 0}
          itemCount={draftOrder?.items?.length || 0}
          onSuccess={handlePayPalSuccess}
          onError={handlePayPalError}
          onCancel={handlePayPalCancel}
        />
      )}

      {selectedPaymentMethod === "credit_card" && (
        <CreditCardForm
          onSubmit={handleCreditCardSubmit}
          isProcessing={isProcessing}
        />
      )}

      {selectedPaymentMethod === "bank_transfer" && (
        <div className="mt-4 border border-gray-200 rounded-md p-4 bg-gray-50">
          <h3 className="font-medium text-gray-800 mb-2">
            Bank Transfer Details
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Please transfer the total amount to the following bank account. Your
            order will be processed after we receive the payment.
          </p>
          <div className="bg-white p-4 rounded border border-gray-200 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-500">Bank Name:</div>
              <div className="font-medium">Example Bank</div>

              <div className="text-gray-500">Account Name:</div>
              <div className="font-medium">Your Store Name</div>

              <div className="text-gray-500">Account Number:</div>
              <div className="font-medium">1234567890</div>

              <div className="text-gray-500">Routing Number:</div>
              <div className="font-medium">987654321</div>

              <div className="text-gray-500">Reference:</div>
              <div className="font-medium">
                {draftOrder?.orderNumber || "Your Order Number"}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPaymentMethod === "cash_on_delivery" && (
        <div className="mt-4 border border-gray-200 rounded-md p-4 bg-gray-50">
          <h3 className="font-medium text-gray-800 mb-2">Cash on Delivery</h3>
          <p className="text-sm text-gray-600">
            You will pay for your order when it is delivered to your shipping
            address. Please have the exact amount ready to ensure a smooth
            delivery.
          </p>
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
