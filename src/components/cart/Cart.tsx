import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import orderApi from '../../utils/orderApi';
import { showToast } from '../ui/ToastProvider';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, totalAmount } = useCart();

  const handleProceedToCheckout = async () => {
    try {
      // Format items for the backend with the exact structure expected
      const formattedItems = cartItems.map(item => ({
        productId: item.id,
        sku: `SKU-${item.id}`, // Generate a temporary SKU if not available
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.price * item.quantity,
        discount: 0,
        tax: (item.price * item.quantity) * 0.18, // 18% VAT
        total: (item.price * item.quantity) * 1.18 // Price + tax
      }));

      // Create the draft order payload
      const draftOrderPayload = {
        items: formattedItems,
        subtotal: totalAmount,
        tax: totalAmount * 0.18, // 18% VAT
        shipping: 0,
        total: totalAmount + (totalAmount * 0.18),
        status: 'draft',
        orderNumber: `DRAFT-${Date.now()}`,
        lastUpdated: new Date().toISOString(),
        paymentMethod: 'card',
        shippingMethod: 'standard',
        shippingAddress: {
          address: '',
          address2: '',
          city: '',
          country: 'Rwanda',
          email: '',
          firstName: '',
          lastName: '',
          phone: '',
          postalCode: '',
          saveAddress: false,
          state: ''
        },
        billingAddress: {
          address: '',
          address2: '',
          city: '',
          country: 'Rwanda',
          email: '',
          firstName: '',
          lastName: '',
          phone: '',
          postalCode: '',
          saveAddress: false,
          state: ''
        }
      };

      // Log the request payload
      console.log('Draft Order Request:', JSON.stringify(draftOrderPayload, null, 2));

      // Create draft order
      const draftOrder = await orderApi.createDraftOrder(draftOrderPayload);

      // Store draft order ID in localStorage
      if (draftOrder.id) {
        localStorage.setItem('checkoutDraftOrderId', draftOrder.id.toString());
      }

      // Navigate to checkout
      navigate('/checkout');
    } catch (error) {
      console.error('Error creating draft order:', error);
      showToast.error('Failed to proceed to checkout. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Rest of your cart component JSX */}
    </div>
  );
};

export default Cart; 