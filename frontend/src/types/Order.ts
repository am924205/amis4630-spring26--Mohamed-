export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  confirmationNumber: string;
  userId: string;
  userEmail?: string | null;
  orderDate: string;
  status: string;
  total: number;
  shippingAddress: string;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  shippingAddress: string;
}
