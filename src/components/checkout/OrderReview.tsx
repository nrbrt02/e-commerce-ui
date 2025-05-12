import React, { useEffect, useState } from "react";
import { useCheckout, PaymentFormData } from "../../context/CheckoutContenxt";
import { PaymentStatus } from "../../context/CheckoutContenxt";
import { AddressFormData } from "../../utils/addressApi";
import orderApi from "../../utils/orderApi";

interface OrderReviewProps {
  addressData: AddressFormData;
  selectedShipping: string;
  selectedPaymentMethod: string;
  paymentData: PaymentFormData;
  cartTotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  orderTotal: number;
  items: any[];
  // Make onPlaceOrder optional with a default implementation
  // onPlaceOrder?: () => Promise<void>;
}

const OrderReview: React.FC<OrderReviewProps> = ({
  addressData,
  selectedShipping,
  selectedPaymentMethod,
  paymentData,
  cartTotal,
  shippingCost,
  taxAmount,
  discountAmount,
  orderTotal,
  items,
  // onPlaceOrder,
}) => {
  const {
    deliveryOptions,
    isProcessingOrder: isLoading,
    goToPrevStep: onPrevStep,
    goToStep,
    draftOrder,
    paymentMethod,
    paymentDetails,
    setPaymentDetails,
    paymentStatus,
    setPaymentStatus,
    handlePlaceOrder: contextPlaceOrder,
  } = useCheckout();

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const onEditShipping = () => goToStep(0);
  const onEditPayment = () => goToStep(2);

  useEffect(() => {
    const checkStoredPayment = async () => {
      try {
        const storedPayment = localStorage.getItem('paypal_payment_response');
        if (storedPayment && paymentMethod === "paypal" && (!paymentDetails || paymentStatus === "pending")) {
          console.log("Found PayPal payment in localStorage that needs to be applied to the order");
          const paymentInfo = JSON.parse(storedPayment);

          const draftOrderId = localStorage.getItem("checkoutDraftOrderId");
          if (draftOrderId) {
            const updateData = {
              paymentMethod: "paypal",
              paymentDetails: paymentInfo,
              paymentStatus: "paid" as PaymentStatus,
            };

            await orderApi.updateDraftOrder(draftOrderId, updateData);
            if (setPaymentDetails) setPaymentDetails(paymentInfo);
            if (setPaymentStatus) setPaymentStatus("paid");
          }
        }
      } catch (error) {
        console.error("Error processing stored payment:", error);
      }
    };

    checkStoredPayment();
  }, [paymentMethod, paymentDetails, paymentStatus, setPaymentDetails, setPaymentStatus]);

  const formatAddress = (address: any) => {
    if (!address) return "No address provided";
    return (
      <div className="space-y-1">
        <p className="font-medium text-gray-800">
          {address.firstName} {address.lastName}
        </p>
        <p className="text-gray-600">{address.address1 || address.address}</p>
        {(address.address2) && <p className="text-gray-600">{address.address2}</p>}
        <p className="text-gray-600">
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p className="text-gray-600">{address.country}</p>
        <p className="text-gray-600">Phone: {address.phone}</p>
        <p className="text-gray-600">Email: {address.email}</p>
      </div>
    );
  };

  const getShippingMethodDetails = () => {
    if (!selectedShipping) return "No shipping method selected";
    const method = deliveryOptions.find((m) => m.id === selectedShipping);
    if (!method) return "Unknown shipping method";
    return (
      <div className="space-y-1">
        <p className="font-medium text-gray-800">{method.name}</p>
        <p className="text-gray-600">{method.description}</p>
        <p className="text-gray-600">
          Estimated delivery: {method.estimatedDays} business days
        </p>
        <p className="text-gray-600 font-medium">
          {formatCurrency(method.price)}
        </p>
      </div>
    );
  };

  const getPaymentMethodDetails = () => {
    if (!selectedPaymentMethod) return "No payment method selected";

    switch (selectedPaymentMethod) {
      case "paypal":
        if (paymentData) {
          return (
            <div className="space-y-1">
              <p className="font-medium text-gray-800">PayPal</p>
              <p className="text-gray-600">
                Transaction ID: {paymentData.transactionId || "N/A"}
              </p>
              <p className="text-gray-600">
                Email: {paymentData.payerEmail || "N/A"}
              </p>
              <div className="mt-2">
                <PaymentStatusBadge status={paymentStatus} />
              </div>
            </div>
          );
        }
        return <p className="font-medium text-gray-800">PayPal</p>;

      case "card":
        if (paymentData) {
          return (
            <div className="space-y-1">
              <p className="font-medium text-gray-800">Credit/Debit Card</p>
              <p className="text-gray-600">
                {paymentData.cardType} ending in {paymentData.lastFour}
              </p>
              <p className="text-gray-600">
                Expires: {paymentData.expiryDate}
              </p>
              <div className="mt-2">
                <PaymentStatusBadge status={paymentStatus} />
              </div>
            </div>
          );
        }
        return <p className="font-medium text-gray-800">Credit/Debit Card</p>;

      case "mobilemoney":
        return (
          <div className="space-y-1">
            <p className="font-medium text-gray-800">Mobile Money</p>
            <p className="text-gray-600">
              Payment will be requested after order confirmation
            </p>
            {paymentData?.phone && (
              <p className="text-gray-600">
                Phone: {paymentData.phone}
              </p>
            )}
          </div>
        );

      case "cod":
        return (
          <div className="space-y-1">
            <p className="font-medium text-gray-800">Cash on Delivery</p>
            <p className="text-gray-600">
              You will pay when your order is delivered.
            </p>
          </div>
        );

      default:
        return <p className="text-gray-400">Unknown payment method</p>;
    }
  };

  const formatCurrency = (amount: number) => {
    const validAmount = isNaN(amount) ? 0 : amount;
    return `Rwf ${validAmount.toLocaleString()}`;
  };

  const handlePlaceOrder = async () => {
    if (!termsAccepted) {
      alert("Please accept the terms and conditions");
      return;
    }
  
    if (
      (selectedPaymentMethod === "paypal" || selectedPaymentMethod === "card") &&
      paymentStatus !== "authorized" &&
      paymentStatus !== "paid"
    ) {
      alert("Please complete the payment process before placing your order");
      return;
    }
  
    try {
      setIsPlacingOrder(true);
      
      // Use the contextPlaceOrder function from the destructured context
      if (typeof contextPlaceOrder === 'function') {
        await contextPlaceOrder();
        return;
      }
      
      // If neither is available, throw an error
      throw new Error("No order placement function available");
    } catch (error) {
      console.error("Error placing order:", error);
      alert(error instanceof Error ? error.message : "There was a problem placing your order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const canPlaceOrder = () => {
    if (selectedPaymentMethod === "paypal" || selectedPaymentMethod === "card") {
      return (
        termsAccepted &&
        (paymentStatus === "authorized" || paymentStatus === "paid")
      );
    }
    return termsAccepted;
  };

  const calculateTotals = () => {
    if (draftOrder) {
      return {
        subtotal: draftOrder.subtotal || 0,
        shipping: draftOrder.shipping || 0,
        tax: draftOrder.tax || 0,
        total: draftOrder.total || 0,
      };
    }

    // Use the props passed in if available
    return { 
      subtotal: cartTotal, 
      shipping: shippingCost, 
      tax: taxAmount, 
      total: orderTotal 
    };
  };

  const { subtotal, shipping, tax, total } = calculateTotals();

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Review</h2>

      <div className="flex justify-end gap-4 mb-6">
        <button
          onClick={onEditShipping}
          className="text-sky-600 hover:text-sky-800 text-sm font-medium flex items-center"
        >
          <i className="fas fa-edit mr-2"></i> Edit Shipping
        </button>
        <button
          onClick={onEditPayment}
          className="text-sky-600 hover:text-sky-800 text-sm font-medium flex items-center"
        >
          <i className="fas fa-edit mr-2"></i> Edit Payment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Shipping Information
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Shipping Address
              </h4>
              <div className="text-sm">
                {formatAddress(addressData)}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Shipping Method
              </h4>
              <div className="text-sm">
                {getShippingMethodDetails()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Payment Information
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </h4>
              <div className="text-sm">
                {getPaymentMethodDetails()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Order Items</h3>
        <div className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-md object-cover" src={item.image} alt={item.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-800">{item.name}</div>
                        {item.variant && (
                          <div className="text-sm text-gray-500">{item.variant}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Order Summary</h3>
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-800">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium text-gray-800">
                {formatCurrency(shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (18% VAT)</span>
              <span className="font-medium text-gray-800">
                {formatCurrency(tax)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-green-600">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-800">Total</span>
                <span className="text-lg font-bold text-gray-800">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="h-5 w-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">
              I agree to the terms and conditions
            </label>
            <p className="text-gray-500 mt-1">
              By placing your order, you agree to our <a href="#" className="text-sky-600 hover:underline">Terms of Service</a>, 
              {' '}<a href="#" className="text-sky-600 hover:underline">Privacy Policy</a>, and 
              {' '}<a href="#" className="text-sky-600 hover:underline">Refund Policy</a>.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onPrevStep}
          className="px-6 py-3 text-sky-600 hover:text-sky-800 font-medium flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Payment
        </button>
        
        <button
          onClick={handlePlaceOrder}
          disabled={!canPlaceOrder() || isLoading || isPlacingOrder}
          className="px-8 py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200 disabled:bg-gray-400 min-w-[180px]"
        >
          {isPlacingOrder ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Processing...
            </>
          ) : (
            'Place Order'
          )}
        </button>
      </div>
    </div>
  );
};

const PaymentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    paid: {
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      icon: "fa-check-circle",
      label: "Paid"
    },
    authorized: {
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      icon: "fa-check-circle",
      label: "Authorized"
    },
    pending: {
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      icon: "fa-clock",
      label: "Pending"
    },
    failed: {
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      icon: "fa-times-circle",
      label: "Failed"
    },
    cancelled: {
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      icon: "fa-ban",
      label: "Cancelled"
    },
    refunded: {
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
      icon: "fa-undo",
      label: "Refunded"
    },
    default: {
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      icon: "fa-info-circle",
      label: "Pending"
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.default;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
    >
      <i className={`fas ${config.icon} mr-1.5`}></i>
      {config.label}
    </span>
  );
};

export default OrderReview;