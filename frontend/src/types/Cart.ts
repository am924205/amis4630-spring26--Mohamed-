export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  id: number;
  userId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
