import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import orderApi from "../utils/orderApi";
import { addressApi, Address, AddressFormData } from "../utils/addressApi";
import { showToast } from "../components/ui/ToastProvider";
import { convertCurrency, formatCurrency, getPayPalAmount } from '../utils/currencyUtils';

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

// Types
export interface PaymentFormData {
  // Common fields
  paymentMethod: string;
  
  // Credit Card fields
  cardNumber?: string;
  cardName?: string;
  expiryDate?: string;
  cvv?: string;
  saveCard?: boolean;
  cardType?: string;
  lastFour?: string;
  
  // PayPal fields
  transactionId?: string;
  payerEmail?: string;
  
  // Mobile Money fields
  phone?: string;
  
  // Generic payment details
  [key: string]: any;
}

export interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays?: number;
  estimatedDelivery?: string;
  available?: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

export interface DraftOrder {
  id?: string | number;
  items: any[];
  subtotal: number;
  tax: number;
  paymentStatus?: PaymentStatus;
  shipping: number;
  total: number;
  totalItems: number;
  shippingAddress?: AddressFormData;
  billingAddress?: AddressFormData;
  shippingMethod?: string;
  shippingOptions?: DeliveryOption[];
  paymentMethod?: string;
  paymentDetails?: any;
  notes?: string;
  status?: string;
  orderNumber?: string;
  lastUpdated?: string;
}

interface CheckoutContextType {
  activeStep: number;
  goToNextStep: () => Promise<void>;
  goToPrevStep: () => void;
  goToStep: (step: number) => void;
  isAuthenticated: boolean;
  paymentStatus: PaymentStatus;
  setPaymentStatus: (status: PaymentStatus) => void;
  addressData: AddressFormData;
  handleAddressChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  paymentData: PaymentFormData;
  paymentDetails: any;
  setErrors: (errors: string[]) => void;
  setPaymentDetails: (details: any) => void;
  handlePaymentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  deliveryOptions: DeliveryOption[];
  selectedShippingMethod: string;
  setSelectedShippingMethod: (method: string) => void;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (method: string) => void;
  cartItems: any[];
  totalAmount: number;
  totalSavings: number;
  shippingCost: number;
  taxAmount: number;
  totalOrderAmount: number;
  isProcessingOrder: boolean;
  orderComplete: boolean;
  orderDetails: any;
  handlePaymentCompletion: (
    paymentData: any,
    newPaymentStatus: PaymentStatus,
    paymentMethod: string
  ) => Promise<boolean>;
  submitOrder: () => Promise<void>;
  createDraftOrder: () => Promise<DraftOrder>;
  updateDraftOrder: (updateData: Partial<DraftOrder>) => Promise<DraftOrder>;
  draftOrder: DraftOrder | null;
  errors: string[];
  clearErrors: () => void;
  savedAddresses: Address[];
  fetchSavedAddresses: () => Promise<void>;
  loadSavedAddress: (addressId: number) => void;
  validateAddress: () => Promise<boolean>;
  validatePayment: () => Promise<boolean>;
  isAddressValid: boolean;
  addressValidationMessage: string | null;
  isLoadingShippingOptions: boolean;
  refreshShippingOptions: () => Promise<void>;
  shippingAddress: AddressFormData;
  billingAddress: AddressFormData;
  useSameAddressForBilling: boolean;
  shippingMethod: string;
  paymentMethod: string;
  availableShippingMethods: DeliveryOption[];
  processOrder: () => Promise<void>;

  selectedShipping: string;
  cartTotal: number;
  discountAmount: number;
  orderTotal: number;
  items: any[];
  handlePlaceOrder: () => Promise<void>;

  convertedAmount: {
    amount: number;
    formattedAmount: string;
  } | null;

  draftOrderStatus: 'saving' | 'saved' | 'error' | null;
  handlePriceUpdate: (prices: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  }) => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State declarations
  const cartContext = useCart();
  const { isAuthenticated, user } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [useSameAddressForBilling, setUseSameAddressForBilling] =
    useState(true);

  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [draftOrder, setDraftOrder] = useState<DraftOrder | null>(null);
  const [isAddressValid, setIsAddressValid] = useState(true);
  const [addressValidationMessage, setAddressValidationMessage] = useState<
    string | null
  >(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isLoadingShippingOptions, setIsLoadingShippingOptions] =
    useState(false);
  const [paymentMethods] = useState<PaymentMethod[]>([
    { id: "card", name: "Credit / Debit Card", icon: "fa-credit-card" },
    { id: "paypal", name: "PayPal", icon: "fa-paypal" },
    { id: "mobilemoney", name: "Mobile Money", icon: "fa-mobile-alt" },
    { id: "cod", name: "Cash on Delivery", icon: "fa-money-bill-wave" },
  ]);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([
    {
      id: "standard",
      name: "Standard Delivery",
      description: "Delivery within 3-5 business days",
      price: 0,
      available: true,
    },
    {
      id: "express",
      name: "Express Delivery",
      description: "Delivery within 1-2 business days",
      price: 0,
      available: true,
    },
    {
      id: "same_day",
      name: "Same Day Delivery",
      description: "Delivery today (order before 2 PM)",
      price: 0,
      available: true,
    },
  ]);
  const [addressData, setAddressData] = useState<AddressFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Rwanda",
    saveAddress: false,
  });
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    paymentMethod: "card",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    saveCard: false,
  });
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState("standard");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [totalOrderAmount, setTotalOrderAmount] = useState(0);

  const draftOrderCreatedRef = useRef(false);
  const isCreatingDraftOrder = useRef(false);

  // Add new state for currency conversion
  const [convertedAmount, setConvertedAmount] = useState<{
    amount: number;
    formattedAmount: string;
  } | null>(null);

  // Add new state for draft order status
  const [draftOrderStatus, setDraftOrderStatus] = useState<'saving' | 'saved' | 'error' | null>(null);

  // Helper functions
  const clearErrors = () => setErrors([]);

  const loadSavedAddress = (addressId: number) => {
    const address = savedAddresses.find((addr) => addr.id === addressId);
    if (address) {
      const formData = addressApi.transformApiToFormAddress(address);
      setAddressData(formData);
      refreshShippingOptions();
    }
  };

  const fetchSavedAddresses = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const addresses = await addressApi.getMyAddresses();
      if (JSON.stringify(addresses) !== JSON.stringify(savedAddresses)) {
        setSavedAddresses(addresses);
        if (addresses.length > 0 && !addressData.firstName) {
          const defaultAddress = addresses.find((addr) => addr.isDefault);
          if (defaultAddress) loadSavedAddress(defaultAddress.id!);
        }
      }
    } catch (error) {
      console.error("Error fetching saved addresses:", error);
      setErrors((prev) => [...prev, "Unable to load saved addresses"]);
    }
  }, [isAuthenticated, savedAddresses, addressData.firstName]);

  // Validation functions
  const validateAddress = async (): Promise<boolean> => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "country",
    ];
    const missingFields = requiredFields.filter(
      (field) => !addressData[field as keyof AddressFormData]
    );

    if (missingFields.length > 0) {
      setIsAddressValid(false);
      setAddressValidationMessage(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addressData.email)) {
      setIsAddressValid(false);
      setAddressValidationMessage("Please enter a valid email address");
      return false;
    }

    const phoneRegex = /^\d{7,15}$/;
    if (!phoneRegex.test(addressData.phone.replace(/[^0-9]/g, ""))) {
      setIsAddressValid(false);
      setAddressValidationMessage("Please enter a valid phone number");
      return false;
    }

    setIsAddressValid(true);
    setAddressValidationMessage(null);
    return true;
  };

  const validatePayment = async (): Promise<boolean> => {
    clearErrors();

    if (selectedPaymentMethod === "card") {
      const requiredFields = ["cardNumber", "cardName", "expiryDate", "cvv"];
      const missingFields = requiredFields.filter(
        (field) => !paymentData[field as keyof PaymentFormData]
      );

      if (missingFields.length > 0) {
        setErrors((prev) => [
          ...prev,
          `Please fill in all required payment fields: ${missingFields.join(
            ", "
          )}`,
        ]);
        return false;
      }

      if (paymentData.cardNumber?.replace(/\D/g, "").slice(-4) || "") {
        setErrors((prev) => [...prev, "Please enter a valid card number"]);
        return false;
      }

      if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate || '')) {
        setErrors((prev) => [
          ...prev,
          "Please enter expiry date in MM/YY format",
        ]);
        return false;
      }
      const pcvv = paymentData.cvv || ''
      if (pcvv.length < 3) {
        setErrors((prev) => [...prev, "Please enter a valid CVV"]);
        return false;
      }

      // For credit cards, we need to check if payment status is valid
      if (paymentStatus !== "authorized" && paymentStatus !== "paid") {
        setErrors((prev) => [...prev, "Please complete the payment process"]);
        return false;
      }
    } else if (selectedPaymentMethod === "paypal") {
      if (paymentStatus !== "paid") {
        const storedResponse = localStorage.getItem("paypal_payment_response");

        if (storedResponse) {
          try {
            const parsedResponse = JSON.parse(storedResponse);
            if (parsedResponse?.status === "COMPLETED") {
              setPaymentStatus("paid");
              return true;
            }
          } catch (e) {
            console.error("Invalid PayPal response format:", e);
          }
        }

        setErrors(["Please complete the PayPal payment process"]);
        return false;
      }
      return true;
    } else if (
      selectedPaymentMethod === "bank_transfer" ||
      selectedPaymentMethod === "cod"
    ) {
      return true;
    } else {
      setErrors((prev) => [...prev, "Please select a payment method"]);
      return false;
    }

    return true;
  };

  const refreshShippingOptions = async () => {
    setIsLoadingShippingOptions(true);
    try {
      // For now, we're using static shipping options with defined prices
      const updatedOptions = [
        {
          id: "standard",
          name: "Standard Delivery",
          description: "Delivery within 3-5 business days",
          price: 0,
          available: true,
          estimatedDays: 5,
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "express",
          name: "Express Delivery",
          description: "Delivery within 1-2 business days",
          price: 2000,
          available: true,
          estimatedDays: 2,
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "same_day",
          name: "Same Day Delivery",
          description: "Delivery today (order before 2 PM)",
          price: 5000,
          available: true,
          estimatedDays: 1,
          estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
      ];

      setDeliveryOptions(updatedOptions);

      // If we have a draft order, update it with the new shipping options
      const draftOrderId = localStorage.getItem("checkoutDraftOrderId");
      if (draftOrderId) {
        const numericId = parseInt(draftOrderId, 10);
        if (!isNaN(numericId)) {
          await orderApi.updateDraftOrder(numericId, {
            shippingOptions: updatedOptions,
            lastUpdated: new Date().toISOString()
          });
        }
      }

      // Set initial shipping cost based on selected method
      const selectedOption = updatedOptions.find(option => option.id === selectedShippingMethod);
      if (selectedOption) {
        setShippingCost(selectedOption.price);
        const newTotal = totalAmount + selectedOption.price + taxAmount;
        setTotalOrderAmount(newTotal);
      }
    } catch (error) {
      console.error("Error fetching shipping options:", error);
      setDeliveryOptions([
        {
          id: "standard",
          name: "Standard Delivery",
          description: "Delivery method will be calculated later",
          price: 0,
          available: true,
        },
      ]);
    } finally {
      setIsLoadingShippingOptions(false);
    }
  };

  const createDraftOrder = useCallback(async (): Promise<DraftOrder> => {
    if (isCreatingDraftOrder.current) {
      return draftOrder as DraftOrder;
    }

    try {
      isCreatingDraftOrder.current = true;
      setDraftOrderStatus('saving');

      const draftOrderData: DraftOrder = {
        items: cartItems,
        subtotal: totalAmount,
        tax: taxAmount,
        shipping: shippingCost,
        total: totalOrderAmount,
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        shippingAddress: addressData,
        billingAddress: useSameAddressForBilling ? addressData : undefined,
        shippingMethod: selectedShippingMethod,
        paymentMethod: selectedPaymentMethod,
        status: 'draft',
        orderNumber: `DRAFT-${Date.now()}`,
        lastUpdated: new Date().toISOString(),
        paymentStatus: paymentStatus,
        paymentDetails: paymentDetails
      };

      // Create draft order using the API
      const createdDraft = await orderApi.createDraftOrder(draftOrderData);
      
      // Update state with the created draft
      setDraftOrder(createdDraft);
      setDraftOrderStatus('saved');

      // Store only the numeric ID in localStorage
      if (createdDraft.id) {
        localStorage.setItem('checkoutDraftOrderId', createdDraft.id.toString());
      }

      return createdDraft;
    } catch (error) {
      console.error('Error creating draft order:', error);
      setDraftOrderStatus('error');
      showToast.error('Failed to save your order progress. Please try again.');
      throw error;
    } finally {
      isCreatingDraftOrder.current = false;
    }
  }, [
    cartItems,
    totalAmount,
    taxAmount,
    shippingCost,
    totalOrderAmount,
    addressData,
    useSameAddressForBilling,
    selectedShippingMethod,
    selectedPaymentMethod,
    paymentStatus,
    paymentDetails
  ]);

  const updateDraftOrder = useCallback(async (updateData: Partial<DraftOrder>): Promise<DraftOrder> => {
    try {
      setDraftOrderStatus('saving');
      
      const updatedDraft: DraftOrder = {
        ...draftOrder!,
        ...updateData,
        lastUpdated: new Date().toISOString(),
        items: updateData.items || draftOrder!.items,
        subtotal: updateData.subtotal ?? draftOrder!.subtotal,
        tax: updateData.tax ?? draftOrder!.tax,
        shipping: updateData.shipping ?? draftOrder!.shipping,
        total: updateData.total ?? draftOrder!.total,
      };

      // Save only the numeric ID in localStorage
      if (updatedDraft.id) {
        localStorage.setItem('checkoutDraftOrderId', updatedDraft.id.toString());
      }
      
      // Update state
      setDraftOrder(updatedDraft);
      setDraftOrderStatus('saved');

      // Show success message for important updates
      if (updateData.paymentStatus === 'paid') {
        showToast.success('Payment completed successfully!');
      } else if (updateData.shippingAddress) {
        showToast.success('Shipping information saved!');
      } else if (updateData.shippingMethod) {
        showToast.success('Delivery method updated!');
      }

      return updatedDraft;
    } catch (error) {
      console.error('Error updating draft order:', error);
      setDraftOrderStatus('error');
      showToast.error('Failed to save your changes. Please try again.');
      throw error;
    }
  }, [draftOrder]);

  const goToNextStep = useCallback(async () => {
    try {
      const nextStep = activeStep + 1;

      // Validate current step data
      if (activeStep === 2 && (paymentStatus === "paid" || paymentStatus === "authorized")) {
        setActiveStep(nextStep);
        return;
      }
      if (activeStep === 0 && !(await validateAddress())) return;
      if (activeStep === 2 && !(await validatePayment())) return;

      // Always update the draft order in the database with current step data
      const draftOrderId = localStorage.getItem("checkoutDraftOrderId");

      if (!draftOrderId || draftOrderId === "undefined") {
        console.error("No draft order ID found in localStorage when trying to go to next step");
        setErrors((prev) => [
          ...prev,
          "Order information not found. Please go back to cart and try again.",
        ]);
        return;
      }

      let updateData: Partial<DraftOrder> = {};

      if (activeStep === 0) {
        // Step 1: Address
        updateData = {
          shippingAddress: addressData,
          billingAddress: useSameAddressForBilling ? addressData : undefined,
          lastUpdated: new Date().toISOString()
        };
        console.log("Updating draft order with address data:", updateData);
      } else if (activeStep === 1) {
        // Step 2: Shipping method
        const selectedOption = deliveryOptions.find(
          (option) => option.id === selectedShippingMethod
        );
        if (selectedOption) {
          // Calculate new totals with shipping
          const newShippingCost = selectedOption.price;
          const newTotal = totalAmount + newShippingCost + taxAmount;

          updateData = {
            shippingMethod: selectedShippingMethod,
            shipping: newShippingCost,
            total: newTotal,
            lastUpdated: new Date().toISOString()
          };
          console.log("Updating draft order with shipping data:", updateData);
        }
      } else if (activeStep === 2) {
        // Step 3: Payment method
        updateData = {
          paymentMethod: selectedPaymentMethod,
          paymentDetails:
            selectedPaymentMethod === "card"
              ? {
                  cardNumber: paymentData.cardNumber || ''
                    .replace(/\D/g, "")
                    .slice(-4),
                  cardholderName: paymentData.cardName,
                  expiryDate: paymentData.expiryDate,
                }
              : {},
          paymentStatus: paymentStatus,
          lastUpdated: new Date().toISOString()
        };
        console.log("Updating draft order with payment data:", updateData);
      }

      // Only make API call if there's data to update
      if (Object.keys(updateData).length > 0) {
        try {
          const numericId = parseInt(draftOrderId, 10);
          if (!isNaN(numericId)) {
            const updatedDraft = await orderApi.updateDraftOrder(numericId, updateData);
            console.log("Draft order updated successfully:", updatedDraft);
            
            // Update local state with the new values
            if (updatedDraft.shipping) {
              setShippingCost(updatedDraft.shipping);
            }
            if (updatedDraft.total) {
              setTotalOrderAmount(updatedDraft.total);
            }
          } else {
            throw new Error("Invalid draft order ID");
          }
        } catch (error) {
          console.error("Failed to update draft order during step navigation:", error);
          setErrors((prev) => [...prev, "Failed to update order information"]);
          // Continue to next step even if update fails
        }
      }

      // Move to next step
      setActiveStep(nextStep);
    } catch (error) {
      console.error("Error in goToNextStep:", error);
      setErrors((prev) => [...prev, "Failed to proceed to next step"]);
    }
  }, [
    activeStep,
    paymentStatus,
    validateAddress,
    validatePayment,
    addressData,
    useSameAddressForBilling,
    deliveryOptions,
    selectedShippingMethod,
    selectedPaymentMethod,
    paymentData,
    totalAmount,
    taxAmount
  ]);

  // Add new effect to check for PayPal payment on mount
  useEffect(() => {
    const checkPayPalPayment = async () => {
      try {
        const storedPayment = localStorage.getItem('paypal_payment_response');
        if (storedPayment && selectedPaymentMethod === "paypal") {
          console.log("Found PayPal payment in localStorage:", storedPayment);
          const paymentInfo = JSON.parse(storedPayment);

          // Update payment details in state
          setPaymentDetails(paymentInfo);
          setPaymentStatus(paymentInfo.status === "COMPLETED" ? "paid" : "pending");

          // Update draft order with payment details
          const draftOrderId = localStorage.getItem("checkoutDraftOrderId");
          if (draftOrderId) {
            const numericId = parseInt(draftOrderId, 10);
            if (!isNaN(numericId)) {
              await orderApi.updateDraftOrder(numericId, {
                paymentMethod: "paypal",
                paymentDetails: paymentInfo,
                paymentStatus: paymentInfo.status === "COMPLETED" ? "paid" : "pending",
                status: paymentInfo.status === "COMPLETED" ? "processing" : "pending",
                lastUpdated: new Date().toISOString()
              });
            }
          }
        }
      } catch (error) {
        console.error("Error processing PayPal payment:", error);
      }
    };

    checkPayPalPayment();
  }, [selectedPaymentMethod]);

  // Update handlePaymentCompletion to properly format PayPal data
  const handlePaymentCompletion = useCallback(async (
    paymentData: any,
    newPaymentStatus: PaymentStatus,
    paymentMethod: string
  ): Promise<boolean> => {
    try {
      setIsProcessingOrder(true);

      // Format PayPal payment data if needed
      let formattedPaymentData = paymentData;
      if (paymentMethod === 'paypal' && paymentData) {
        // Validate required PayPal fields
        const requiredFields = ['transactionId', 'payerId', 'payerEmail', 'amount', 'currency', 'status'];
        const missingFields = requiredFields.filter(field => !paymentData[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required PayPal payment fields: ${missingFields.join(', ')}`);
        }

        formattedPaymentData = {
          transactionId: paymentData.transactionId,
          payerId: paymentData.payerId,
          payerEmail: paymentData.payerEmail,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: paymentData.status,
          createTime: paymentData.createTime,
          updateTime: paymentData.updateTime,
          paymentMethod: 'paypal',
          paymentProvider: 'paypal',
          paymentType: 'online',
          paymentStatus: 'COMPLETED'
        };

        // Store in localStorage with timestamp
        const storageData = {
          ...formattedPaymentData,
          storedAt: new Date().toISOString()
        };
        localStorage.setItem('paypal_payment_response', JSON.stringify(storageData));
      }

      // Convert amount for PayPal
      if (paymentMethod === 'paypal') {
        const converted = await getPayPalAmount(totalOrderAmount);
        setConvertedAmount(converted);
      }

      // Update draft order with payment information
      const draftOrderId = localStorage.getItem("checkoutDraftOrderId");
      if (draftOrderId) {
        const numericId = parseInt(draftOrderId, 10);
        if (!isNaN(numericId)) {
          try {
            await orderApi.updateDraftOrder(numericId, {
              paymentStatus: newPaymentStatus,
              paymentDetails: formattedPaymentData,
              status: 'processing',
              lastUpdated: new Date().toISOString()
            });
          } catch (updateError) {
            console.error('Error updating draft order with payment details:', updateError);
            // Continue with payment process even if draft update fails
          }
        }
      }

      setPaymentStatus(newPaymentStatus);
      setPaymentDetails(formattedPaymentData);
      return true;
    } catch (error) {
      console.error('Error handling payment completion:', error);
      setErrors(['Payment processing failed. Please try again.']);
      return false;
    } finally {
      setIsProcessingOrder(false);
    }
  }, [totalOrderAmount]);

  const submitOrder = async (): Promise<void> => {
    try {
      setIsProcessingOrder(true);
      setErrors([]);

      // Get the draft order ID from localStorage
      const draftOrderIdStr = localStorage.getItem('checkoutDraftOrderId');
      if (!draftOrderIdStr) {
        throw new Error('No draft order found. Please restart the checkout process.');
      }

      // Parse and validate the draft order ID
      const draftOrderId = parseInt(draftOrderIdStr, 10);
      if (isNaN(draftOrderId)) {
        throw new Error('Invalid draft order ID format. Please restart the checkout process.');
      }

      // Get PayPal payment details if using PayPal
      let paymentDetails = {};
      if (selectedPaymentMethod === 'paypal') {
        const paypalResponse = localStorage.getItem('paypal_payment_response');
        if (paypalResponse) {
          try {
            paymentDetails = JSON.parse(paypalResponse);
          } catch (error) {
            console.error('Error parsing PayPal response:', error);
          }
        }
      }

      // Update the draft order with payment details
      await orderApi.updateDraftOrder(draftOrderId, {
        paymentDetails,
        paymentStatus: selectedPaymentMethod === 'paypal' ? 'paid' : 'pending',
        lastUpdated: new Date().toISOString()
      });

      // Convert draft order to final order
      const order = await orderApi.convertDraftToOrder(draftOrderId);
      
      // Clear the cart and draft order from localStorage
      localStorage.removeItem('checkoutDraftOrderId');
      localStorage.removeItem('fastShoppingCart');
      localStorage.removeItem('paypal_payment_response');

      // Update the order state
      setOrderDetails(order);
      setOrderComplete(true);
      
      // Show success message
      showToast.success('Order placed successfully! Thank you for your purchase.');
    } catch (error: any) {
      console.error('Error submitting order:', error);
      setErrors([error.message || 'Failed to submit order. Please try again.']);
      showToast.error('Failed to place your order. Please try again.');
      throw error;
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const processOrder = useCallback(async () => {
    try {
      const result = await submitOrder();
      return result;
    } catch (error) {
      console.error("Error processing order:", error);
      throw error;
    }
  }, [submitOrder]);

  const goToPrevStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));
  const goToStep = (step: number) =>
    setActiveStep(Math.max(0, Math.min(step, 3)));

  // Form handlers
  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({ ...prev, [name]: value }));
    setIsAddressValid(true);
    setAddressValidationMessage(null);
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
      setPaymentData((prev) => ({ ...prev, [name]: formattedValue }));
      return;
    }

    if (name === "expiryDate") {
      let formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length > 2) {
        formattedValue =
          formattedValue.slice(0, 2) + "/" + formattedValue.slice(2, 4);
      }
      setPaymentData((prev) => ({ ...prev, [name]: formattedValue }));
      return;
    }

    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === "address.saveAddress") {
      setAddressData((prev) => ({ ...prev, saveAddress: checked }));
    } else if (name === "payment.saveCard") {
      setPaymentData((prev) => ({ ...prev, saveCard: checked }));
    } else if (name === "useSameAddressForBilling") {
      setUseSameAddressForBilling(checked);
    }
  };

  // Effects
  useEffect(() => {
    // Initialize cart data on component mount
    if (cartContext.cartItems.length > 0) {
      setCartItems(cartContext.cartItems);
      setTotalAmount(cartContext.totalAmount);
      setTotalSavings(cartContext.totalSavings);

      // Calculate tax (18% VAT)
      const calculatedTax = cartContext.totalAmount * 0.18;
      setTaxAmount(calculatedTax);

      // Calculate total order amount (subtotal + tax + shipping)
      setTotalOrderAmount(
        cartContext.totalAmount + calculatedTax + shippingCost
      );
    }
  }, [
    cartContext.cartItems,
    cartContext.totalAmount,
    cartContext.totalSavings,
    shippingCost,
  ]);

  // Check for existing draft order on load
  useEffect(() => {
    const checkExistingDraftOrder = async () => {
      const existingDraftId = localStorage.getItem("checkoutDraftOrderId");
      if (existingDraftId && existingDraftId !== "undefined" && !draftOrder) {
        try {
          // Ensure we're passing a numeric ID
          const numericId = parseInt(existingDraftId, 10);
          if (isNaN(numericId)) {
            throw new Error('Invalid draft order ID');
          }
          
          const existingOrder = await orderApi.getDraftOrder(numericId);
          if (existingOrder) {
            setDraftOrder(existingOrder);

            // Load data from draft order
            if (existingOrder.shippingAddress) {
              setAddressData(existingOrder.shippingAddress);
              // If billing address exists and is different from shipping, set useSameAddressForBilling to false
              if (existingOrder.billingAddress && 
                  JSON.stringify(existingOrder.billingAddress) !== JSON.stringify(existingOrder.shippingAddress)) {
                setUseSameAddressForBilling(false);
              }
            }
            if (existingOrder.shippingMethod) {
              setSelectedShippingMethod(existingOrder.shippingMethod);
            }
            if (existingOrder.paymentMethod) {
              setSelectedPaymentMethod(existingOrder.paymentMethod);
            }
            if (existingOrder.paymentStatus) {
              setPaymentStatus(existingOrder.paymentStatus);
            }
            if (existingOrder.paymentDetails) {
              setPaymentDetails(existingOrder.paymentDetails);
            }

            // Set cart data from draft order
            if (existingOrder.items && existingOrder.items.length > 0) {
              setCartItems(existingOrder.items);
            }

            // Set order amounts
            if (existingOrder.subtotal) setTotalAmount(existingOrder.subtotal);
            if (existingOrder.tax) setTaxAmount(existingOrder.tax);
            if (existingOrder.shipping) setShippingCost(existingOrder.shipping);
            if (existingOrder.total) setTotalOrderAmount(existingOrder.total);

            // Set the active step based on the order's progress
            if (existingOrder.paymentStatus === "paid") {
              setActiveStep(3); // Go to review step if payment is complete
            } else if (existingOrder.shippingAddress && existingOrder.shippingMethod) {
              setActiveStep(2); // Go to payment step if shipping is complete
            } else if (existingOrder.shippingAddress) {
              setActiveStep(1); // Go to shipping step if address is complete
            }
          }
        } catch (error) {
          console.error("Error loading draft order:", error);
          localStorage.removeItem("checkoutDraftOrderId");
          showToast.error("Failed to load your saved order. Starting fresh checkout.");
        }
      }
    };

    checkExistingDraftOrder();
  }, []);

  // Load user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.email && !addressData.email)
        setAddressData((prev) => ({ ...prev, email: user.email }));
      if (user.firstName && !addressData.firstName)
        setAddressData((prev) => ({
          ...prev,
          firstName: user.firstName || "",
        }));
      if (user.lastName && !addressData.lastName)
        setAddressData((prev) => ({ ...prev, lastName: user.lastName || "" }));
      if (user.phone && !addressData.phone)
        setAddressData((prev) => ({ ...prev, phone: user.phone || "" }));
    }
  }, [
    isAuthenticated,
    user,
    addressData.email,
    addressData.firstName,
    addressData.lastName,
    addressData.phone,
  ]);

  // Update shipping options when address changes
  useEffect(() => {
    if (addressData.country && addressData.city && activeStep >= 0) {
      refreshShippingOptions();
    }
  }, [addressData.country, addressData.city, activeStep]);

  // Update totals when shipping method changes
  useEffect(() => {
    const selectedOption = deliveryOptions.find(
      (option) => option.id === selectedShippingMethod
    );
    if (selectedOption) {
      const newShippingCost = selectedOption.price;
      const newTotal = totalAmount + newShippingCost + taxAmount;
      
      setShippingCost(newShippingCost);
      setTotalOrderAmount(newTotal);

      // Update draft order with new shipping information
      const draftOrderId = localStorage.getItem("checkoutDraftOrderId");
      if (draftOrderId) {
        const numericId = parseInt(draftOrderId, 10);
        if (!isNaN(numericId)) {
          orderApi.updateDraftOrder(numericId, {
            shippingMethod: selectedShippingMethod,
            shipping: newShippingCost,
            total: newTotal,
            lastUpdated: new Date().toISOString()
          }).catch(error => {
            console.error("Error updating draft order with shipping:", error);
          });
        }
      }
    }
  }, [selectedShippingMethod, deliveryOptions, totalAmount, taxAmount]);

  // Add new function to handle price updates from OrderSummary
  const handlePriceUpdate = useCallback((prices: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  }) => {
    // Update draft order with the latest prices
    const draftOrderId = localStorage.getItem("checkoutDraftOrderId");
    if (draftOrderId) {
      const numericId = parseInt(draftOrderId, 10);
      if (!isNaN(numericId)) {
        orderApi.updateDraftOrder(numericId, {
          subtotal: prices.subtotal,
          shipping: prices.shipping,
          tax: prices.tax,
          total: prices.total,
          lastUpdated: new Date().toISOString()
        }).catch(error => {
          console.error("Error updating draft order with prices:", error);
        });
      }
    }
  }, []);

  // Add cleanup effect
  useEffect(() => {
    const handleBeforeUnload = () => {
      // If the user leaves the page without completing the order,
      // we'll keep the draft order for 24 hours
      const draftOrderId = localStorage.getItem('checkoutDraftOrderId');
      if (draftOrderId) {
        const cleanupTime = new Date();
        cleanupTime.setHours(cleanupTime.getHours() + 24);
        localStorage.setItem('draftOrderCleanupTime', cleanupTime.toISOString());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Add cleanup check on mount
  useEffect(() => {
    const checkAndCleanupDraftOrders = async () => {
      const cleanupTime = localStorage.getItem('draftOrderCleanupTime');
      if (cleanupTime) {
        const cleanupDate = new Date(cleanupTime);
        if (cleanupDate < new Date()) {
          // Cleanup time has passed, remove the draft order
          const draftOrderId = localStorage.getItem('checkoutDraftOrderId');
          if (draftOrderId) {
            try {
              const numericId = parseInt(draftOrderId, 10);
              if (!isNaN(numericId)) {
                await orderApi.deleteDraftOrder(numericId);
                localStorage.removeItem('checkoutDraftOrderId');
                localStorage.removeItem('draftOrderCleanupTime');
              }
            } catch (error) {
              console.error('Error cleaning up draft order:', error);
            }
          }
        }
      }
    };

    checkAndCleanupDraftOrders();
  }, []);

  const value: CheckoutContextType = {
    activeStep,
    goToNextStep,
    goToPrevStep,
    goToStep,
    isAuthenticated,
    addressData,
    handleAddressChange,
    paymentData,
    paymentDetails,
    setPaymentDetails,
    handlePaymentChange,
    handleCheckboxChange,
    handlePaymentCompletion,
    deliveryOptions,
    paymentStatus,
    setPaymentStatus,
    selectedShippingMethod: selectedShippingMethod,
    setSelectedShippingMethod,
    paymentMethods,
    selectedPaymentMethod,
    setErrors,
    setSelectedPaymentMethod,
    cartItems,
    totalAmount: totalAmount,
    totalSavings,
    shippingCost,
    taxAmount,
    totalOrderAmount: totalOrderAmount,
    isProcessingOrder,
    orderComplete,
    orderDetails,
    submitOrder: submitOrder,
    createDraftOrder,
    updateDraftOrder,
    draftOrder,
    errors,
    clearErrors,
    savedAddresses,
    fetchSavedAddresses,
    loadSavedAddress,
    validateAddress,
    validatePayment,
    isAddressValid,
    addressValidationMessage,
    isLoadingShippingOptions,
    refreshShippingOptions,
    shippingAddress: addressData,
    billingAddress: addressData,
    useSameAddressForBilling,
    shippingMethod: selectedShippingMethod,
    paymentMethod: selectedPaymentMethod,
    availableShippingMethods: deliveryOptions,
    processOrder,

    selectedShipping: selectedShippingMethod,
    cartTotal: totalAmount, 
    discountAmount: totalSavings, 
    orderTotal: totalOrderAmount,
    items: cartItems, 
    handlePlaceOrder: submitOrder,

    convertedAmount,
    draftOrderStatus,
    handlePriceUpdate,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};
