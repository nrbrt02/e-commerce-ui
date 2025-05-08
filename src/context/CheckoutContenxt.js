import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback, useRef, } from "react";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import orderApi from "../utils/orderApi";
import { addressApi } from "../utils/addressApi";
import { showToast } from "../components/ui/ToastProvider";
import { PaymentStatus } from "../types/order";
const CheckoutContext = createContext(undefined);
export const CheckoutProvider = ({ children, }) => {
    const cartContext = useCart();
    const { isAuthenticated, user } = useAuth();
    const [paymentStatus, setPaymentStatus] = useState(PaymentStatus.PENDING);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [useSameAddressForBilling, setUseSameAddressForBilling] = useState(true);
    const [activeStep, setActiveStep] = useState(0);
    const [errors, setErrors] = useState([]);
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [draftOrder, setDraftOrder] = useState(null);
    const [isAddressValid, setIsAddressValid] = useState(true);
    const [addressValidationMessage, setAddressValidationMessage] = useState(null);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [isLoadingShippingOptions, setIsLoadingShippingOptions] = useState(false);
    const [paymentMethods] = useState([
        { id: "card", name: "Credit / Debit Card", icon: "fa-credit-card" },
        { id: "paypal", name: "PayPal", icon: "fa-paypal" },
        { id: "mobilemoney", name: "Mobile Money", icon: "fa-mobile-alt" },
        { id: "cod", name: "Cash on Delivery", icon: "fa-money-bill-wave" },
    ]);
    const [deliveryOptions, setDeliveryOptions] = useState([
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
    const [addressData, setAddressData] = useState({
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
    const [paymentData, setPaymentData] = useState({
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvv: "",
        saveCard: false,
    });
    const [selectedShippingMethod, setSelectedShippingMethod] = useState("standard");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalSavings, setTotalSavings] = useState(0);
    const [shippingCost, setShippingCost] = useState(0);
    const [taxAmount, setTaxAmount] = useState(0);
    const [totalOrderAmount, setTotalOrderAmount] = useState(0);
    const draftOrderCreatedRef = useRef(false);
    const isCreatingDraftOrder = useRef(false);
    const convertAddressToFormData = (address) => {
        if (!address) {
            return {
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                address: "",
                address2: "",
                city: "",
                state: "",
                postalCode: "",
                country: "",
                saveAddress: false,
            };
        }
        return {
            firstName: address.firstName || "",
            lastName: address.lastName || "",
            email: "",
            phone: address.phone || "",
            address: address.addressLine1 || "",
            address2: address.addressLine2 || "",
            city: address.city || "",
            state: address.state || "",
            postalCode: address.postalCode || address.zipCode || "",
            country: address.country || "",
            saveAddress: !!address.isDefault,
        };
    };
    const convertFormDataToAddress = (formData) => {
        return {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            addressLine1: formData.address,
            addressLine2: formData.address2,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
            isDefault: formData.saveAddress,
        };
    };
    const clearErrors = () => setErrors([]);
    const loadSavedAddress = (addressId) => {
        const address = savedAddresses.find((addr) => addr.id === addressId);
        if (address) {
            const formData = addressApi.transformApiToFormAddress(address);
            setAddressData(formData);
            refreshShippingOptions();
        }
    };
    const fetchSavedAddresses = useCallback(async () => {
        if (!isAuthenticated)
            return;
        try {
            const addresses = await addressApi.getMyAddresses();
            if (JSON.stringify(addresses) !== JSON.stringify(savedAddresses)) {
                setSavedAddresses(addresses);
                if (addresses.length > 0 && !addressData.firstName) {
                    const defaultAddress = addresses.find((addr) => addr.isDefault);
                    if (defaultAddress)
                        loadSavedAddress(defaultAddress.id);
                }
            }
        }
        catch (error) {
            console.error("Error fetching saved addresses:", error);
            setErrors((prev) => [...prev, "Unable to load saved addresses"]);
        }
    }, [isAuthenticated, savedAddresses, addressData.firstName]);
    const validateAddress = async () => {
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
        const missingFields = requiredFields.filter((field) => !addressData[field]);
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
    const validatePayment = async () => {
        clearErrors();
        if (selectedPaymentMethod === "card") {
            const requiredFields = ["cardNumber", "cardName", "expiryDate", "cvv"];
            const missingFields = requiredFields.filter((field) => !paymentData[field]);
            if (missingFields.length > 0) {
                setErrors((prev) => [
                    ...prev,
                    `Please fill in all required payment fields: ${missingFields.join(", ")}`,
                ]);
                return false;
            }
            if (paymentData.cardNumber.replace(/\s/g, "").length < 16) {
                setErrors((prev) => [...prev, "Please enter a valid card number"]);
                return false;
            }
            if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
                setErrors((prev) => [
                    ...prev,
                    "Please enter expiry date in MM/YY format",
                ]);
                return false;
            }
            if (paymentData.cvv.length < 3) {
                setErrors((prev) => [...prev, "Please enter a valid CVV"]);
                return false;
            }
            if (paymentStatus !== "authorized" && paymentStatus !== "paid") {
                setErrors((prev) => [...prev, "Please complete the payment process"]);
                return false;
            }
        }
        else if (selectedPaymentMethod === "paypal") {
            if (paymentStatus !== "paid") {
                const storedResponse = localStorage.getItem("paypal_payment_response");
                if (storedResponse) {
                    try {
                        const parsedResponse = JSON.parse(storedResponse);
                        if (parsedResponse?.status === "COMPLETED") {
                            setPaymentStatus(PaymentStatus.PAID);
                            return true;
                        }
                    }
                    catch (e) {
                        console.error("Invalid PayPal response format:", e);
                    }
                }
                setErrors(["Please complete the PayPal payment process"]);
                return false;
            }
            return true;
        }
        else if (selectedPaymentMethod === "bank_transfer" ||
            selectedPaymentMethod === "cod") {
            return true;
        }
        else {
            setErrors((prev) => [...prev, "Please select a payment method"]);
            return false;
        }
        return true;
    };
    const refreshShippingOptions = async () => {
        setIsLoadingShippingOptions(true);
        try {
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
            setShippingCost(0);
        }
        catch (error) {
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
        }
        finally {
            setIsLoadingShippingOptions(false);
        }
    };
    const createDraftOrder = useCallback(async () => {
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
            const existingDraftId = localStorage.getItem("checkoutDraftOrderId");
            if (existingDraftId && existingDraftId !== "undefined") {
                try {
                    console.log("Checking for existing draft order:", existingDraftId);
                    const existingOrder = await orderApi.getDraftOrder(existingDraftId);
                    if (existingOrder) {
                        console.log("Existing draft order found:", existingOrder);
                        setDraftOrder({
                            ...existingOrder,
                            shippingAddress: convertAddressToFormData(existingOrder.shippingAddress),
                            billingAddress: convertAddressToFormData(existingOrder.billingAddress),
                        });
                        if (existingOrder.paymentStatus) {
                            setPaymentStatus(existingOrder.paymentStatus);
                        }
                        isCreatingDraftOrder.current = false;
                        return {
                            ...existingOrder,
                            shippingAddress: convertAddressToFormData(existingOrder.shippingAddress),
                            billingAddress: convertAddressToFormData(existingOrder.billingAddress),
                        };
                    }
                }
                catch (error) {
                    console.error("Error loading existing draft:", error);
                    localStorage.removeItem("checkoutDraftOrderId");
                }
            }
            if (draftOrder && draftOrder.id) {
                console.log("Using draft order from state:", draftOrder);
                isCreatingDraftOrder.current = false;
                return draftOrder;
            }
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
            const orderItems = orderApi.transformCartToOrderItems(itemsToProcess);
            const subtotal = itemsToProcess.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const tax = subtotal * 0.18;
            const shipping = 0;
            setTotalAmount(subtotal);
            setTaxAmount(tax);
            setShippingCost(shipping);
            setTotalOrderAmount(subtotal + tax + shipping);
            const draftData = {
                items: orderItems,
                subtotal,
                tax,
                shipping,
                total: subtotal + tax + shipping,
                paymentStatus: PaymentStatus.PENDING,
                shippingMethod: "standard",
                status: "draft",
            };
            console.log("Creating draft order with:", draftData);
            const newDraftOrder = await orderApi.createDraftOrder({
                ...draftData,
                shippingAddress: addressData
                    ? convertFormDataToAddress(addressData)
                    : undefined,
                billingAddress: addressData
                    ? convertFormDataToAddress(addressData)
                    : undefined,
                paymentStatus: "pending",
            });
            console.log("Draft order created:", newDraftOrder);
            const frontendDraft = {
                ...newDraftOrder,
                shippingAddress: convertAddressToFormData(newDraftOrder.shippingAddress),
                billingAddress: convertAddressToFormData(newDraftOrder.billingAddress),
            };
            setDraftOrder(frontendDraft);
            if (newDraftOrder && newDraftOrder.id) {
                localStorage.setItem("checkoutDraftOrderId", String(newDraftOrder.id));
                draftOrderCreatedRef.current = true;
                console.log("Draft order ID saved to localStorage:", newDraftOrder.id);
            }
            else {
                console.error("No ID found in draft order response:", newDraftOrder);
            }
            isCreatingDraftOrder.current = false;
            return frontendDraft;
        }
        catch (error) {
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
    }, [cartContext.cartItems, draftOrder, clearErrors, addressData]);
    const updateDraftOrder = useCallback(async (updateData) => {
        try {
            const draftOrderId = localStorage.getItem("checkoutDraftOrderId");
            const updatedData = { ...updateData };
            if (updateData.paymentDetails && !updateData.paymentStatus) {
                updatedData.paymentStatus = PaymentStatus.PENDING;
                setPaymentStatus(PaymentStatus.PENDING);
            }
            if (!draftOrderId || draftOrderId === "undefined") {
                console.log("No draft ID found in localStorage, creating new draft");
                return await createDraftOrder();
            }
            console.log(`Updating draft order ${draftOrderId} with:`, updatedData);
            try {
                const backendUpdateData = {
                    ...updatedData,
                    shippingAddress: updatedData.shippingAddress
                        ? convertFormDataToAddress(updatedData.shippingAddress)
                        : undefined,
                    billingAddress: updatedData.billingAddress
                        ? convertFormDataToAddress(updatedData.billingAddress)
                        : undefined,
                    paymentStatus: updatedData.paymentStatus,
                };
                const updatedDraft = await orderApi.updateDraftOrder(draftOrderId, backendUpdateData);
                console.log("Draft order updated:", updatedDraft);
                const frontendDraft = {
                    ...updatedDraft,
                    shippingAddress: convertAddressToFormData(updatedDraft.shippingAddress),
                    billingAddress: convertAddressToFormData(updatedDraft.billingAddress),
                };
                setDraftOrder(frontendDraft);
                if (updatedData.paymentStatus) {
                    setPaymentStatus(updatedData.paymentStatus);
                }
                return frontendDraft;
            }
            catch (apiError) {
                console.error("API error updating draft order:", apiError);
                console.log("Creating new draft order as fallback...");
                return await createDraftOrder();
            }
        }
        catch (error) {
            console.error("Error updating draft order:", error);
            setErrors((prev) => [...prev, "Failed to update order"]);
            throw error;
        }
    }, [createDraftOrder, setErrors, setPaymentStatus]);
    const goToNextStep = useCallback(async () => {
        try {
            const nextStep = activeStep + 1;
            if (activeStep === 2 &&
                (paymentStatus === "paid" || paymentStatus === "authorized")) {
                setActiveStep(nextStep);
                return;
            }
            if (activeStep === 0 && !(await validateAddress()))
                return;
            if (activeStep === 2 && !(await validatePayment()))
                return;
            const draftOrderId = localStorage.getItem("checkoutDraftOrderId");
            if (!draftOrderId || draftOrderId === "undefined") {
                console.error("No draft order ID found in localStorage when trying to go to next step");
                setErrors((prev) => [
                    ...prev,
                    "Order information not found. Please go back to cart and try again.",
                ]);
                return;
            }
            let updateData = {};
            if (activeStep === 0) {
                updateData = {
                    shippingAddress: addressData,
                    billingAddress: addressData,
                };
                console.log("Updating draft order with address data:", updateData);
            }
            else if (activeStep === 1) {
                const selectedOption = deliveryOptions.find((option) => option.id === selectedShippingMethod);
                if (selectedOption) {
                    updateData = {
                        shippingMethod: selectedShippingMethod,
                        shipping: selectedOption.price,
                    };
                    console.log("Updating draft order with shipping data:", updateData);
                }
            }
            else if (activeStep === 2) {
                updateData = {
                    paymentMethod: selectedPaymentMethod,
                    paymentDetails: selectedPaymentMethod === "card"
                        ? {
                            cardNumber: paymentData.cardNumber
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
            if (Object.keys(updateData).length > 0) {
                try {
                    const updatedDraft = await updateDraftOrder(updateData);
                    console.log("Draft order updated successfully:", updatedDraft);
                }
                catch (error) {
                    console.error("Failed to update draft order during step navigation:", error);
                    setErrors((prev) => [...prev, "Failed to update order information"]);
                }
            }
            setActiveStep(nextStep);
        }
        catch (error) {
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
    const handlePaymentCompletion = useCallback(async (paymentData, newPaymentStatus, paymentMethod) => {
        try {
            console.log("Starting payment completion handler");
            const draftOrderId = localStorage.getItem("checkoutDraftOrderId");
            if (!draftOrderId || draftOrderId === "undefined") {
                console.error("No draft order ID found in localStorage");
                setErrors(["Order information not found. Please try again."]);
                return false;
            }
            const updateData = {
                paymentMethod,
                paymentDetails: paymentData,
                paymentStatus: newPaymentStatus,
            };
            console.log("Update data for draft order:", updateData);
            const updatedDraft = await orderApi.updateDraftOrder(draftOrderId, updateData);
            console.log("Draft order updated:", updatedDraft);
            setDraftOrder((prev) => (prev ? { ...prev, ...updateData } : null));
            setPaymentStatus(newPaymentStatus);
            setPaymentDetails(paymentData);
            if (newPaymentStatus === "paid" || newPaymentStatus === "authorized") {
                console.log("Payment successful, navigating to review step");
                setActiveStep(3);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error("Error handling payment completion:", error);
            setErrors([
                "Failed to update order with payment details. Please try again.",
            ]);
            return false;
        }
    }, [setActiveStep, setErrors, setPaymentStatus, setPaymentDetails]);
    const submitOrder = useCallback(async () => {
        try {
            clearErrors();
            setIsProcessingOrder(true);
            const draftOrderId = localStorage.getItem("checkoutDraftOrderId");
            if (!draftOrderId || draftOrderId === "undefined") {
                console.error("No draft order ID found in localStorage");
                showToast.error("No draft order to submit. Please try again or return to cart.");
                throw new Error("No draft order to submit. Please try again or return to cart.");
            }
            if (!addressData.firstName ||
                !addressData.lastName ||
                !addressData.email ||
                !addressData.phone ||
                !addressData.address ||
                !addressData.city ||
                !addressData.state ||
                !addressData.country) {
                showToast.error("Please complete your shipping information");
                throw new Error("Please complete your shipping information");
            }
            if (selectedPaymentMethod === "paypal" ||
                selectedPaymentMethod === "card") {
                if (paymentStatus !== "paid" && paymentStatus !== "authorized") {
                    showToast.error("Please complete the payment process before placing your order");
                    throw new Error("Please complete the payment process before placing your order");
                }
            }
            const updateData = {
                shippingAddress: convertFormDataToAddress(addressData),
                billingAddress: convertFormDataToAddress(addressData),
                shippingMethod: selectedShippingMethod,
                paymentMethod: selectedPaymentMethod,
                paymentDetails: selectedPaymentMethod === "card"
                    ? {
                        cardNumber: paymentData.cardNumber.replace(/\D/g, "").slice(-4),
                        cardholderName: paymentData.cardName,
                        expiryDate: paymentData.expiryDate,
                    }
                    : {},
                paymentStatus: (selectedPaymentMethod === "cod" ||
                    selectedPaymentMethod === "bank_transfer"
                    ? "pending"
                    : paymentStatus),
            };
            console.log(`Updating draft order ${draftOrderId} with final data:`, updateData);
            await orderApi.updateDraftOrder(draftOrderId, updateData);
            localStorage.removeItem("paypal_payment_response");
            console.log(`Converting draft order ${draftOrderId} to a real order`);
            const finalOrder = await orderApi.convertDraftToOrder(draftOrderId);
            console.log("Final order created:", finalOrder);
            if (isAuthenticated && addressData.saveAddress) {
                try {
                    const apiAddress = {
                        ...addressApi.transformFormToApiAddress(addressData),
                        addressLine1: addressData.address,
                        addressLine2: addressData.address2,
                    };
                    await addressApi.saveAddress(apiAddress);
                }
                catch (err) {
                    console.error("Error saving address:", err);
                }
            }
            showToast.success("Order placed successfully!");
            setOrderComplete(true);
            setOrderDetails(finalOrder);
            cartContext.clearCart();
            draftOrderCreatedRef.current = false;
            localStorage.removeItem("checkoutDraftOrderId");
            return finalOrder;
        }
        catch (error) {
            console.error("Error submitting order:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to submit order";
            showToast.error(errorMessage);
            setErrors((prev) => [...prev, errorMessage]);
            throw error;
        }
        finally {
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
            return {
                ...result,
                subtotal: result.subtotal || 0,
                tax: result.tax || 0,
                shipping: result.shipping || 0,
                total: result.total || 0,
            };
        }
        catch (error) {
            console.error("Error processing order:", error);
            throw error;
        }
        finally {
            setIsProcessingOrder(false);
        }
    }, [submitOrder]);
    const goToPrevStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));
    const goToStep = (step) => setActiveStep(Math.max(0, Math.min(step, 3)));
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddressData((prev) => ({ ...prev, [name]: value }));
        setIsAddressValid(true);
        setAddressValidationMessage(null);
    };
    const handlePaymentChange = (e) => {
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
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        if (name === "address.saveAddress") {
            setAddressData((prev) => ({ ...prev, saveAddress: checked }));
        }
        else if (name === "payment.saveCard") {
            setPaymentData((prev) => ({ ...prev, saveCard: checked }));
        }
        else if (name === "useSameAddressForBilling") {
            setUseSameAddressForBilling(checked);
        }
    };
    useEffect(() => {
        if (cartContext.cartItems.length > 0) {
            setCartItems(cartContext.cartItems);
            setTotalAmount(cartContext.totalAmount);
            setTotalSavings(cartContext.totalSavings);
            const calculatedTax = cartContext.totalAmount * 0.18;
            setTaxAmount(calculatedTax);
            setTotalOrderAmount(cartContext.totalAmount + calculatedTax + shippingCost);
        }
    }, [
        cartContext.cartItems,
        cartContext.totalAmount,
        cartContext.totalSavings,
        shippingCost,
    ]);
    useEffect(() => {
        const checkExistingDraftOrder = async () => {
            const existingDraftId = localStorage.getItem("checkoutDraftOrderId");
            if (existingDraftId && existingDraftId !== "undefined" && !draftOrder) {
                try {
                    const existingOrder = await orderApi.getDraftOrder(existingDraftId);
                    if (existingOrder) {
                        const frontendOrder = {
                            ...existingOrder,
                            shippingAddress: convertAddressToFormData(existingOrder.shippingAddress),
                            billingAddress: convertAddressToFormData(existingOrder.billingAddress),
                        };
                        setDraftOrder(frontendOrder);
                        if (existingOrder.shippingAddress) {
                            const shippingAddress = convertAddressToFormData(existingOrder.shippingAddress);
                            setAddressData(shippingAddress);
                        }
                        if (existingOrder.shippingMethod)
                            setSelectedShippingMethod(existingOrder.shippingMethod);
                        if (existingOrder.paymentMethod)
                            setSelectedPaymentMethod(existingOrder.paymentMethod);
                        if (existingOrder.paymentStatus)
                            setPaymentStatus(existingOrder.paymentStatus);
                        if (existingOrder.items && existingOrder.items.length > 0) {
                            setCartItems(existingOrder.items);
                        }
                        if (existingOrder.subtotal)
                            setTotalAmount(existingOrder.subtotal);
                        if (existingOrder.tax)
                            setTaxAmount(existingOrder.tax);
                        if (existingOrder.shipping)
                            setShippingCost(existingOrder.shipping);
                        if (existingOrder.total)
                            setTotalOrderAmount(existingOrder.total);
                    }
                }
                catch (error) {
                    console.error("Error loading draft order:", error);
                    localStorage.removeItem("checkoutDraftOrderId");
                }
            }
        };
        checkExistingDraftOrder();
    }, []);
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
    useEffect(() => {
        if (addressData.country && addressData.city && activeStep >= 0) {
            refreshShippingOptions();
        }
    }, [addressData.country, addressData.city, activeStep]);
    useEffect(() => {
        const selectedOption = deliveryOptions.find((option) => option.id === selectedShippingMethod);
        if (selectedOption) {
            setShippingCost(selectedOption.price);
            setTotalOrderAmount(totalAmount + selectedOption.price + taxAmount);
        }
    }, [selectedShippingMethod, deliveryOptions, totalAmount, taxAmount]);
    const value = {
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
        selectedShippingMethod,
        setSelectedShippingMethod,
        paymentMethods,
        selectedPaymentMethod,
        setErrors,
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
        shippingAddress: addressData,
        billingAddress: addressData,
        useSameAddressForBilling,
        shippingMethod: selectedShippingMethod,
        paymentMethod: selectedPaymentMethod,
        availableShippingMethods: deliveryOptions,
        processOrder,
    };
    return (_jsx(CheckoutContext.Provider, { value: value, children: children }));
};
export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (context === undefined) {
        throw new Error("useCheckout must be used within a CheckoutProvider");
    }
    return context;
};
