import { Product } from "../types/Product";
import { apiFetch, apiJson } from "./apiClient";

export async function fetchProducts(): Promise<Product[]> {
  const res = await apiFetch("/api/products", { skipAuth: true });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProduct(id: number): Promise<Product> {
  const res = await apiFetch(`/api/products/${id}`, { skipAuth: true });
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function createProduct(product: Omit<Product, "id">): Promise<Product> {
  return apiJson<Product>("/api/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export async function updateProduct(id: number, product: Product): Promise<Product> {
  return apiJson<Product>(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await apiFetch(`/api/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete product");
}
