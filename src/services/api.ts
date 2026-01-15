import { invoke } from "@tauri-apps/api/core";
import type { Product, CreateProductInput, UpdateProductInput } from "@/types";

// Product API
export const productApi = {
  getAll: async (): Promise<Product[]> => {
    return await invoke("get_all_products");
  },

  getById: async (id: number): Promise<Product> => {
    return await invoke("get_product_by_id", { id });
  },

  create: async (input: CreateProductInput): Promise<Product> => {
    return await invoke("create_product", { input });
  },

  update: async (input: UpdateProductInput): Promise<Product> => {
    return await invoke("update_product", { input });
  },

  delete: async (id: number): Promise<void> => {
    return await invoke("delete_product", { id });
  },

  search: async (query: string): Promise<Product[]> => {
    return await invoke("search_products", { query });
  },
};
