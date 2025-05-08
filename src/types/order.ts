import { Address } from './address';

export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
    COMPLETED = 'completed',
    DRAFT = 'draft'
}
  
export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded',
    AUTHORIZED = 'authorized',
    CANCELLED = 'cancelled'
}
  
export interface Customer {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
}
  
export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    metadata?: any;
    product?: {
        id: number;
        name: string;
        slug: string;
        imageUrl?: string;
    };
}
  
export interface Order {
    id: number;
    customerId: number;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    totalItems: number;
    paymentStatus: PaymentStatus;
    paymentMethod?: string | null;
    paymentDetails?: any;
    shippingMethod?: string | null;
    shippingAddress?: Address | null;
    billingAddress?: Address | null;
    notes?: string | null;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
    customer: Customer;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
}
  
export interface DraftOrder {
    id: number | string;
    items: any[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    status: string;
    orderNumber: string;
    shippingMethod?: string | null;
    shippingAddress?: Address | null;
    billingAddress?: Address | null;
    paymentMethod?: string | null;
    paymentDetails?: any;
    paymentStatus?: PaymentStatus;
    customer?: Customer;
    metadata?: any;
}