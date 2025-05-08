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
  shippingAddress?: AddressFormData;
  billingAddress?: AddressFormData;
  shippingMethod?: string;
  paymentMethod?: string;
  paymentDetails?: any;
  notes?: string;
  status?: string;
  orderNumber?: string;
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
  submitOrder: () => Promise<any>;
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
      // For now, we're using static shipping options with free shipping
      setDeliveryOptions([
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

      // Set shipping cost to 0 for now
      setShippingCost(0);
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
    // Prevent multiple simultaneous calls
    if (isCreatingDraftOrder.current) {
      console.log("Draft order creation already in progress");
      return new Promise((resolve) => {
        const checkDraftOrder = setInterval(() => {
          if (!isCreatingDraftOrder.current && draftOrder) {
            clearInterval(checkDraftOrder);
            resolve(draftOrder);
          }
        }, 100);
      });
    }

    isCreatingDraftOrder.current = true;

    try {
      clearErrors();

      // Check for existing draft first
      const existingDraftId = localStorage.getItem("checkoutDraftOrderId");
      if (existingDraftId && existingDraftId !== "undefined") {
        try {
          console.log("Checking for existing draft order:", existingDraftId);
          const existingOrder = await orderApi.getDraftOrder(existingDraftId);
          if (existingOrder) {
            console.log("Existing draft order found:", existingOrder);
            setDraftOrder(existingOrder);
            if (existingOrder.paymentStatus) {
              setPaymentStatus(existingOrder.paymentStatus);
            }
            isCreatingDraftOrder.current = false;
            return existingOrder;
          }
        } catch (error) {
          console.error("Error loading existing draft:", error);
          localStorage.removeItem("checkoutDraftOrderId");
        }
      }

      // If we have a draftOrder in state already, return it
      if (draftOrder && draftOrder.id) {
        console.log("Using draft order from state:", draftOrder);
        isCreatingDraftOrder.current = false;
        return draftOrder;
      }

      // Get cart items
      let itemsToProcess = [...cartContext.cartItems];

      if (itemsToProcess.length === 0) {
        console.log("No items in cart context, checking localStorage");
        const savedCart = localStorage.getItem("fastShoppingCart");
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            console.log("Found items in localStorage:", parsedCart.length);
            itemsToProcess = parsedCart;
          }
        }
      }

      setCartItems(itemsToProcess);

      if (itemsToProcess.length === 0) {
        console.error("No items in cart");
        throw new Error("Your cart is empty");
      }

      // Calculate order totals
      const orderItems = orderApi.transformCartToOrderItems(itemsToProcess);
      const subtotal = itemsToProcess.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const tax = subtotal * 0.18; // 18% VAT
      const shipping = 0; // Free shipping for now

      // Update state with calculated values
      setTotalAmount(subtotal);
      setTaxAmount(tax);
      setShippingCost(shipping);
      setTotalOrderAmount(subtotal + tax + shipping);

      const draftData: Partial<DraftOrder> = {
        items: orderItems,
        subtotal,
        tax,
        shipping,
        total: subtotal + tax + shipping,
        paymentStatus: "pending",
        shippingMethod: "standard", // Default to standard shipping
        status: "draft",
      };

      console.log("Creating draft order with:", draftData);

      // Create the draft order via API
      const newDraftOrder = await orderApi.createDraftOrder(draftData);
      console.log("Draft order created:", newDraftOrder);

      // Save the new draft order to state
      setDraftOrder(newDraftOrder);

      // Store the ID in localStorage
      if (newDraftOrder && newDraftOrder.id) {
        localStorage.setItem("checkoutDraftOrderId", String(newDraftOrder.id));
        draftOrderCreatedRef.current = true;
        console.log("Draft order ID saved to localStorage:", newDraftOrder.id);
      } else {
        console.error("No ID found in draft order response:", newDraftOrder);
      }

      isCreatingDraftOrder.current = false;
      return newDraftOrder;
    } catch (error) {
      console.error("Error creating draft order:", error);
      setErrors((prev) => [
        ...prev,
        error instanceof Error
          ? error.message
          : "Failed to create order. Please try again.",
      ]);
      isCreatingDraftOrder.current = false;
      throw error;
    }
  }, [cartContext.cartItems, draftOrder, clearErrors]);

  const updateDraftOrder = useCallback(
    async (updateData: Partial<DraftOrder>): Promise<DraftOrder> => {
      try {
        // Get draft order ID from localStorage, not from state
        const draftOrderId = localStorage.getItem("checkoutDraftOrderId");

        // If payment details are being updated but status isn't provided, set to pending
        const updatedData = { ...updateData };
        if (updateData.paymentDetails && !updateData.paymentStatus) {
          updatedData.paymentStatus = "pending";
          setPaymentStatus("pending");
        }

        if (!draftOrderId || draftOrderId === "undefined") {
          console.log("No draft ID found in localStorage, creating new draft");
          return await createDraftOrder();
        }

        // If we get here, we have a valid draft ID in localStorage
        console.log(`Updating draft order ${draftOrderId} with:`, updatedData);

        try {
          // Make the API call to update the draft order
          const updatedDraft = await orderApi.updateDraftOrder(
            draftOrderId,
            updatedData
          );
          console.log("Draft order updated:", updatedDraft);

          // Update the state with the new draft order
          setDraftOrder(updatedDraft);

          // Update payment status if it was changed
          if (updatedData.paymentStatus) {
            setPaymentStatus(updatedData.paymentStatus);
          }

          return updatedDraft;
        } catch (apiError) {
          console.error("API error updating draft order:", apiError);
          // Try again with a new draft order if API fails
          console.log("Creating new draft order as fallback...");
          return await createDraftOrder();
        }
      } catch (error) {
        console.error("Error updating draft order:", error);
        setErrors((prev) => [...prev, "Failed to update order"]);
        throw error;
      }
    },
    [createDraftOrder, setErrors, setPaymentStatus]
  );

  const goToNextStep = useCallback(async () => {
    try {
      const nextStep = activeStep + 1;

      // Validate current step data

      if (
        activeStep === 2 &&
        (paymentStatus === "paid" || paymentStatus === "authorized")
      ) {
        setActiveStep(nextStep);
        return;
      }
      if (activeStep === 0 && !(await validateAddress())) return;
      if (activeStep === 2 && !(await validatePayment())) return;
      // Always update the draft order in the database with current step data
      const draftOrderId = localStorage.getItem("checkoutDraftOrderId");

      if (!draftOrderId || draftOrderId === "undefined") {
        console.error(
          "No draft order ID found in localStorage when trying to go to next step"
        );
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
          billingAddress: addressData,
        };
        console.log("Updating draft order with address data:", updateData);
      } else if (activeStep === 1) {
        // Step 2: Shipping method
        const selectedOption = deliveryOptions.find(
          (option) => option.id === selectedShippingMethod
        );
        if (selectedOption) {
          updateData = {
            shippingMethod: selectedShippingMethod,
            shipping: selectedOption.price,
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
        };
        console.log("Updating draft order with payment data:", updateData);
      }

      // Only make API call if there's data to update
      if (Object.keys(updateData).length > 0) {
        try {
          const updatedDraft = await updateDraftOrder(updateData);
          console.log("Draft order updated successfully:", updatedDraft);
        } catch (error) {
          console.error(
            "Failed to update draft order during step navigation:",
            error
          );
          setErrors((prev) => [...prev, "Failed to update order information"]);
          // Continue to next step even if update fails
        }
      }

      // Move to next step
      setActiveStep(nextStep);
    } catch (error) {
      console.error("Error during step navigation:", error);
      setErrors((prev) => [
        ...prev,
        "Failed to proceed to next step. Please try again.",
      ]);
    }
  }, [
    activeStep,
    addressData,
    selectedShippingMethod,
    deliveryOptions,
    selectedPaymentMethod,
    paymentData,
    paymentStatus,
    validateAddress,
    validatePayment,
    updateDraftOrder,
  ]);

  const handlePaymentCompletion = useCallback(
    async (
      paymentData: any,
      newPaymentStatus: PaymentStatus,
      paymentMethod: string
    ): Promise<boolean> => {
      try {
        console.log("Starting payment completion handler");

        // Get the draft order ID
        const draftOrderId = localStorage.getItem("checkoutDraftOrderId");
        if (!draftOrderId || draftOrderId === "undefined") {
          console.error("No draft order ID found in localStorage");
          setErrors(["Order information not found. Please try again."]);
          return false;
        }

        // Create the update data object
        const updateData: Partial<DraftOrder> = {
          paymentMethod,
          paymentDetails: paymentData,
          paymentStatus: newPaymentStatus,
        };

        console.log("Update data for draft order:", updateData);

        // Update the draft order via API
        const updatedDraft = await orderApi.updateDraftOrder(
          draftOrderId,
          updateData
        );
        console.log("Draft order updated:", updatedDraft);

        // Update local state
        setDraftOrder((prev) => (prev ? { ...prev, ...updateData } : null));
        setPaymentStatus(newPaymentStatus);
        setPaymentDetails(paymentData);

        // For successful payments, navigate to review step
        if (newPaymentStatus === "paid" || newPaymentStatus === "authorized") {
          console.log("Payment successful, navigating to review step");
          setActiveStep(3); // Review step
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error handling payment completion:", error);
        setErrors([
          "Failed to update order with payment details. Please try again.",
        ]);
        return false;
      }
    },
    [setActiveStep, setErrors, setPaymentStatus, setPaymentDetails]
  );

  const submitOrder = useCallback(async () => {
    try {
      clearErrors();
      setIsProcessingOrder(true);

      // Get draft order ID from localStorage
      const draftOrderId = localStorage.getItem("checkoutDraftOrderId");

      if (!draftOrderId || draftOrderId === "undefined") {
        console.error("No draft order ID found in localStorage");
        showToast.error(
          "No draft order to submit. Please try again or return to cart."
        );
        throw new Error(
          "No draft order to submit. Please try again or return to cart."
        );
      }

      // Validate order data
      if (
        !addressData.firstName ||
        !addressData.lastName ||
        !addressData.email ||
        !addressData.phone ||
        !addressData.address ||
        !addressData.city ||
        !addressData.state ||
        !addressData.country
      ) {
        showToast.error("Please complete your shipping information");
        throw new Error("Please complete your shipping information");
      }

      // Validate payment status for payment methods that require pre-authorization
      if (
        selectedPaymentMethod === "paypal" ||
        selectedPaymentMethod === "card"
      ) {
        if (paymentStatus !== "paid" && paymentStatus !== "authorized") {
          showToast.error(
            "Please complete the payment process before placing your order"
          );
          throw new Error(
            "Please complete the payment process before placing your order"
          );
        }
      }

      // First, update the draft with final data
      const updateData = {
        shippingAddress: addressData,
        billingAddress: addressData,
        shippingMethod: selectedShippingMethod,
        paymentMethod: selectedPaymentMethod,
        paymentDetails:
          selectedPaymentMethod === "card"
            ? {
                cardNumber: paymentData.cardNumber?.replace(/\D/g, "").slice(-4),
                cardholderName: paymentData.cardName,
                expiryDate: paymentData.expiryDate,
              }
            : {},
        // Only auto-mark as paid for cash on delivery or bank transfer
        // For paypal and credit card, use the existing payment status
        paymentStatus:
          selectedPaymentMethod === "cod" ||
          selectedPaymentMethod === "bank_transfer"
            ? "pending"
            : paymentStatus,
      };

      console.log(
        `Updating draft order ${draftOrderId} with final data:`,
        updateData
      );

      await orderApi.updateDraftOrder(draftOrderId, updateData);
      localStorage.removeItem("paypal_payment_response");
      console.log(`Converting draft order ${draftOrderId} to a real order`);
      const finalOrder = await orderApi.convertDraftToOrder(draftOrderId);
      console.log("Final order created:", finalOrder);

      // Save address if requested by user
      if (isAuthenticated && addressData.saveAddress) {
        try {
          const apiAddress = addressApi.transformFormToApiAddress(addressData);
          await addressApi.saveAddress(apiAddress);
        } catch (err) {
          console.error("Error saving address:", err);
        }
      }

      // Show success message
      showToast.success("Order placed successfully!");

      // Update state to show order completion
      setOrderComplete(true);
      setOrderDetails(finalOrder);

      // Clear cart and references
      cartContext.clearCart();
      draftOrderCreatedRef.current = false;
      localStorage.removeItem("checkoutDraftOrderId");

      return finalOrder;
    } catch (error) {
      console.error("Error submitting order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit order";
      showToast.error(errorMessage);
      setErrors((prev) => [...prev, errorMessage]);
      throw error;
    } finally {
      setIsProcessingOrder(false);
    }
  }, [
    addressData,
    selectedShippingMethod,
    selectedPaymentMethod,
    paymentData,
    paymentStatus,
    isAuthenticated,
    cartContext,
    clearErrors,
  ]);

  const processOrder = useCallback(async () => {
    try {
      setIsProcessingOrder(true);
      const result = await submitOrder();
      return result;
    } catch (error) {
      console.error("Error processing order:", error);
      throw error;
    } finally {
      setIsProcessingOrder(false);
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
          const existingOrder = await orderApi.getDraftOrder(existingDraftId);
          if (existingOrder) {
            setDraftOrder(existingOrder);

            // Load data from draft order
            if (existingOrder.shippingAddress)
              setAddressData(existingOrder.shippingAddress);
            if (existingOrder.shippingMethod)
              setSelectedShippingMethod(existingOrder.shippingMethod);
            if (existingOrder.paymentMethod)
              setSelectedPaymentMethod(existingOrder.paymentMethod);
            if (existingOrder.paymentStatus)
              setPaymentStatus(existingOrder.paymentStatus);

            // Set cart data from draft order
            if (existingOrder.items && existingOrder.items.length > 0) {
              setCartItems(existingOrder.items);
            }

            // Set order amounts
            if (existingOrder.subtotal) setTotalAmount(existingOrder.subtotal);
            if (existingOrder.tax) setTaxAmount(existingOrder.tax);
            if (existingOrder.shipping) setShippingCost(existingOrder.shipping);
            if (existingOrder.total) setTotalOrderAmount(existingOrder.total);
          }
        } catch (error) {
          console.error("Error loading draft order:", error);
          localStorage.removeItem("checkoutDraftOrderId");
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
      setShippingCost(selectedOption.price);
      setTotalOrderAmount(totalAmount + selectedOption.price + taxAmount);
    }
  }, [selectedShippingMethod, deliveryOptions, totalAmount, taxAmount]);

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
