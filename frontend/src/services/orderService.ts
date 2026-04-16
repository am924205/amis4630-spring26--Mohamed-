import { Order, CreateOrderRequest } from "../types/Order";
import { apiJson } from "./apiClient";

export async function createOrder(req: CreateOrderRequest): Promise<Order> {
  return apiJson<Order>("/api/orders", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function fetchMyOrders(): Promise<Order[]> {
  return apiJson<Order[]>("/api/orders/mine");
}

export async function fetchAllOrders(): Promise<Order[]> {
  return apiJson<Order[]>("/api/orders");
}

export async function updateOrderStatus(orderId: number, status: string): Promise<Order> {
  return apiJson<Order>(`/api/orders/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}
