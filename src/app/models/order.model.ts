import { Product } from './product.model';
import { User } from './user.model';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  product: Product;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  user: User;
  status: OrderStatus;
  totalAmount: number;
  shippingName: string;
  shippingAddress: string;
  phone: string;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderCreateRequest {
  items: OrderItemRequest[];
  shippingName: string;
  shippingAddress: string;
  phone: string;
  paymentMethod: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
