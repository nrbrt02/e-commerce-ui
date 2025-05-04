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

// Types (keep your existing types here)
export interface PaymentFormData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  saveCard: boolean;
}

export interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
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
  // Keep all your existing context type definitions
  // ...
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State declarations
  const cartContext = useCart();
  const { isAuthenticated, user } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [draftOrder, setDraftOrder] = useState<DraftOrder | null>(null);
  const [isAddressValid, setIsAddressValid] = useState(true);
  const [addressValidationMessage, setAddressValidationMessage] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isLoadingShippingOptions, setIsLoadingShippingOptions] = useState(false);
  const [paymentMethods] = useState<PaymentMethod[]>([
    { id: "card", name: "Credit / Debit Card", icon: "fa-credit-card" },
    { id: "paypal", name: "PayPal", icon: "fa-paypal" },
    { id: "mobilemoney", name: "Mobile Money", icon: "fa-mobile-alt" },
    { id: "cod", name: "Cash on Delivery", icon: "fa-money-bill-wave" },
  ]);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([
    { id: "standard", name: "Standard Delivery", description: "Delivery within 3-5 business days", price: 0 },
    { id: "express", name: "Express Delivery", description: "Delivery within 1-2 business days", price: 2000 },
    { id: "same_day", name: "Same Day Delivery", description: "Delivery today (order before 2 PM)", price: 5000 },
  ]);
  const [addressData, setAddressData] = useState<AddressFormData>({
    firstName: "", lastName: "", email: "", phone: "", address: "", address2: "",
    city: "", state: "", postalCode: "", country: "Rwanda", saveAddress: false
  });
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    cardNumber: "", cardName: "", expiryDate: "", cvv: "", saveCard: false
  });
  const [selectedShippingMethod, setSelectedShippingMethod] = useState("standard");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [totalOrderAmount, setTotalOrderAmount] = useState(0);

  const draftOrderCreatedRef = useRef(false);
  const cartProcessedRef = useRef(false);

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
    const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city", "state", "country"];
    const missingFields = requiredFields.filter(field => !addressData[field as keyof AddressFormData]);

    if (missingFields.length > 0) {
      setIsAddressValid(false);
      setAddressValidationMessage(`Please fill in all required fields: ${missingFields.join(", ")}`);
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
    if (selectedPaymentMethod === "card") {
      const requiredFields = ["cardNumber", "cardName", "expiryDate", "cvv"];
      const missingFields = requiredFields.filter(field => !paymentData[field as keyof PaymentFormData]);

      if (missingFields.length > 0) {
        setErrors((prev) => [...prev, `Please fill in all required payment fields: ${missingFields.join(", ")}`]);
        return false;
      }

      if (paymentData.cardNumber.replace(/\s/g, "").length < 16) {
        setErrors((prev) => [...prev, "Please enter a valid card number"]);
        return false;
      }

      if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
        setErrors((prev) => [...prev, "Please enter expiry date in MM/YY format"]);
        return false;
      }

      if (paymentData.cvv.length < 3) {
        setErrors((prev) => [...prev, "Please enter a valid CVV"]);
        return false;
      }
    }
    return true;
  };

  const refreshShippingOptions = async () => {
    setIsLoadingShippingOptions(true);
    try {
      setDeliveryOptions([
        { id: "standard", name: "Standard Delivery", description: "Delivery method will be calculated later", price: 0, available: true },
      ]);
    } catch (error) {
      console.error("Error fetching shipping options:", error);
      setDeliveryOptions([
        { id: "standard", name: "Standard Delivery", description: "Delivery method will be calculated later", price: 0, available: true },
      ]);
    } finally {
      setIsLoadingShippingOptions(false);
    }
  };

  // Core checkout functions
  const createDraftOrder = useCallback(async (): Promise<DraftOrder> => {
    try {
      clearErrors();

      // Check for existing draft first
      const existingDraftId = localStorage.getItem("checkoutDraftOrderId");
      if (existingDraftId && existingDraftId !== "undefined") {
        try {
          const existingOrder = await orderApi.getDraftOrder(existingDraftId);
          if (existingOrder) {
            setDraftOrder(existingOrder);
            return existingOrder;
          }
        } catch (error) {
          console.error("Error loading existing draft:", error);
          localStorage.removeItem("checkoutDraftOrderId");
        }
      }

      // Get cart items
      let itemsToProcess = [...cartContext.cartItems];
      if (itemsToProcess.length === 0) {
        const savedCart = localStorage.getItem("fastShoppingCart");
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            itemsToProcess = parsedCart;
            setCartItems(parsedCart);
          }
        }
      }

      if (itemsToProcess.length === 0) {
        throw new Error("Your cart is empty");
      }

      if (draftOrder && draftOrder.id) {
        console.log("Draft order already exists, returning existing order");
        return draftOrder;
      }

      // Calculate order totals
      const orderItems = orderApi.transformCartToOrderItems(itemsToProcess);
      const subtotal = itemsToProcess.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * 0.18;
      const selectedOption = deliveryOptions.find(option => option.id === selectedShippingMethod);
      const shipping = selectedOption ? selectedOption.price : 0;

      const draftData: Partial<DraftOrder> = {
        items: orderItems,
        subtotal,
        tax,
        shipping,
        total: subtotal + tax + shipping,
        shippingMethod: selectedShippingMethod,
        status: "draft",
      };

      console.log("Creating draft order with:", draftData);
      const newDraftOrder = await orderApi.createDraftOrder(draftData);
      console.log("Draft order created:", newDraftOrder);

      setDraftOrder(newDraftOrder);
      if (newDraftOrder.id) {
        localStorage.setItem("checkoutDraftOrderId", String(newDraftOrder.id));
      }
      return newDraftOrder;
    } catch (error) {
      console.error("Error creating draft order:", error);
      setErrors((prev) => [...prev, error instanceof Error ? error.message : "Failed to create order. Please try again."]);
      throw error;
    }
  }, [cartContext.cartItems, selectedShippingMethod, deliveryOptions, draftOrder, clearErrors]);

  const updateDraftOrder = useCallback(async (updateData: Partial<DraftOrder>): Promise<DraftOrder> => {
    try {
      const draftId = localStorage.getItem("checkoutDraftOrderId");
      
      if (!draftId || draftId === "undefined") {
        console.log("No draft ID found, creating new draft");
        return await createDraftOrder();
      }

      console.log(`Updating draft order ${draftId} with:`, updateData);
      const updatedDraft = await orderApi.updateDraftOrder(draftId, updateData);
      
      setDraftOrder(updatedDraft);
      return updatedDraft;
    } catch (error) {
      console.error("Error updating draft order:", error);
      setErrors(prev => [...prev, "Failed to update order"]);
      throw error;
    }
  }, [createDraftOrder]);

  const submitOrder = useCallback(async () => {
    try {
      clearErrors();
      setIsProcessingOrder(true);

      if (!draftOrder || !draftOrder.id) {
        console.error("No draft order found", draftOrder);
        throw new Error("No draft order to submit");
      }

      // Validate order data
      if (!addressData.firstName || !addressData.lastName || !addressData.email || 
          !addressData.phone || !addressData.address || !addressData.city || 
          !addressData.state || !addressData.country) {
        throw new Error("Please complete your shipping information");
      }

      const finalOrderData = {
        shippingAddress: addressData,
        billingAddress: addressData,
        shippingMethod: selectedShippingMethod,
        paymentMethod: selectedPaymentMethod,
        paymentDetails: selectedPaymentMethod === "card" ? {
          cardNumber: paymentData.cardNumber.replace(/\D/g, "").slice(-4),
          cardholderName: paymentData.cardName,
          expiryDate: paymentData.expiryDate,
        } : {},
        status: "pending",
      };

      console.log("Submitting order with:", finalOrderData);
      const finalOrder = await orderApi.submitOrder(draftOrder.id, finalOrderData);
      console.log("Final order created:", finalOrder);

      if (isAuthenticated && addressData.saveAddress) {
        try {
          const apiAddress = addressApi.transformFormToApiAddress(addressData);
          await addressApi.saveAddress(apiAddress);
        } catch (err) {
          console.error("Error saving address:", err);
        }
      }

      setOrderComplete(true);
      setOrderDetails(finalOrder);
      cartContext.clearCart();
      draftOrderCreatedRef.current = false;
      cartProcessedRef.current = false;
      localStorage.removeItem("checkoutDraftOrderId");

      return finalOrder;
    } catch (error) {
      console.error("Error submitting order:", error);
      setErrors((prev) => [...prev, error instanceof Error ? error.message : "Failed to submit order"]);
      throw error;
    } finally {
      setIsProcessingOrder(false);
    }
  }, [draftOrder, addressData, selectedShippingMethod, selectedPaymentMethod, paymentData, isAuthenticated, cartContext, clearErrors]);

  // Navigation functions
  const goToNextStep = useCallback(async () => {
    try {
      const nextStep = activeStep + 1;

      if (activeStep === 0 && !(await validateAddress())) return;
      if (activeStep === 2 && !(await validatePayment())) return;

      if (draftOrder) {
        let updateData: Partial<DraftOrder> = {};

        if (activeStep === 0) {
          updateData = { shippingAddress: addressData, billingAddress: addressData };
        } else if (activeStep === 1) {
          const selectedOption = deliveryOptions.find(option => option.id === selectedShippingMethod);
          if (selectedOption) {
            updateData = { shippingMethod: selectedShippingMethod, shipping: selectedOption.price };
          }
        } else if (activeStep === 2) {
          updateData = {
            paymentMethod: selectedPaymentMethod,
            paymentDetails: selectedPaymentMethod === "card" ? {
              cardNumber: paymentData.cardNumber.replace(/\D/g, "").slice(-4),
              cardholderName: paymentData.cardName,
              expiryDate: paymentData.expiryDate,
            } : {},
          };
        }

        if (Object.keys(updateData).length > 0) {
          await updateDraftOrder(updateData);
        }
      }

      setActiveStep(nextStep);
    } catch (error) {
      console.error("Error updating draft order during step navigation:", error);
      setErrors((prev) => [...prev, "Failed to update order. Please try again."]);
    }
  }, [activeStep, draftOrder, addressData, selectedShippingMethod, deliveryOptions, selectedPaymentMethod, paymentData, validateAddress, validatePayment, updateDraftOrder]);

  const goToPrevStep = () => setActiveStep(prev => Math.max(prev - 1, 0));
  const goToStep = (step: number) => setActiveStep(Math.max(0, Math.min(step, 3)));

  // Form handlers
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressData(prev => ({ ...prev, [name]: value }));
    setIsAddressValid(true);
    setAddressValidationMessage(null);
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const formattedValue = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
      setPaymentData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }

    if (name === "expiryDate") {
      let formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length > 2) {
        formattedValue = formattedValue.slice(0, 2) + "/" + formattedValue.slice(2, 4);
      }
      setPaymentData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }

    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === "address.saveAddress") {
      setAddressData(prev => ({ ...prev, saveAddress: checked }));
    } else if (name === "payment.saveCard") {
      setPaymentData(prev => ({ ...prev, saveCard: checked }));
    }
  };

  // Effects
  useEffect(() => {
    const initializeCheckout = async () => {
      if (cartProcessedRef.current) return;

      const existingDraftId = localStorage.getItem("checkoutDraftOrderId");
      if (existingDraftId && existingDraftId !== "undefined") {
        try {
          const existingOrder = await orderApi.getDraftOrder(existingDraftId);
          if (existingOrder) {
            setDraftOrder(existingOrder);
            draftOrderCreatedRef.current = true;
            
            if (existingOrder.shippingAddress) setAddressData(existingOrder.shippingAddress);
            if (existingOrder.paymentMethod) setSelectedPaymentMethod(existingOrder.paymentMethod);
            if (existingOrder.shippingMethod) setSelectedShippingMethod(existingOrder.shippingMethod);
            
            cartProcessedRef.current = true;
            return;
          }
        } catch (error) {
          console.error("Error loading draft order:", error);
          localStorage.removeItem("checkoutDraftOrderId");
        }
      }

      if (cartContext.cartItems.length > 0) {
        try {
          await createDraftOrder();
          cartProcessedRef.current = true;
          draftOrderCreatedRef.current = true;
        } catch (error) {
          setErrors(prev => [...prev, "Failed to initialize checkout"]);
        }
      }
    };

    initializeCheckout();
  }, [cartContext.cartItems]);

  useEffect(() => {
    if (isAuthenticated && user && savedAddresses.length === 0) {
      const fetchAddresses = async () => {
        try {
          const addresses = await addressApi.getMyAddresses();
          setSavedAddresses(addresses);
          if (addresses.length > 0 && !addressData.firstName) {
            const defaultAddress = addresses.find(addr => addr.isDefault);
            if (defaultAddress) loadSavedAddress(defaultAddress.id!);
          }
        } catch (error) {
          console.error("Error fetching saved addresses:", error);
          setErrors(prev => [...prev, "Unable to load saved addresses"]);
        }
      };
      fetchAddresses();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.email && !addressData.email) setAddressData(prev => ({ ...prev, email: user.email }));
      if (user.firstName && !addressData.firstName) setAddressData(prev => ({ ...prev, firstName: user.firstName || "" }));
      if (user.lastName && !addressData.lastName) setAddressData(prev => ({ ...prev, lastName: user.lastName || "" }));
      if (user.phone && !addressData.phone) setAddressData(prev => ({ ...prev, phone: user.phone || "" }));
    }
  }, [isAuthenticated, user, addressData.email, addressData.firstName, addressData.lastName, addressData.phone]);

  useEffect(() => {
    if (addressData.country && addressData.city && activeStep >= 0) {
      refreshShippingOptions();
    }
  }, [addressData.country, addressData.city, activeStep]);

  useEffect(() => {
    const selectedOption = deliveryOptions.find(option => option.id === selectedShippingMethod);
    if (selectedOption) {
      setShippingCost(selectedOption.price);
      setTotalOrderAmount(totalAmount + selectedOption.price + taxAmount);
    }
  }, [selectedShippingMethod, deliveryOptions, totalAmount, taxAmount]);

  // Context value
  const value: CheckoutContextType = {
    activeStep,
    goToNextStep,
    goToPrevStep,
    goToStep,
    isAuthenticated,
    addressData,
    handleAddressChange,
    paymentData,
    handlePaymentChange,
    handleCheckboxChange,
    deliveryOptions,
    selectedShippingMethod,
    setSelectedShippingMethod,
    paymentMethods,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    cartItems,
    totalAmount,
    totalSavings,
    shippingCost,
    taxAmount,
    totalOrderAmount,
    isProcessingOrder,
    orderComplete,
    orderDetails,
    submitOrder,
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