import { invoke } from "@tauri-apps/api/core";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  AffiliateLink,
  AffiliateProgramDiscovery,
  GenerateLinkRequest,
  GenerateLinkForPlatformRequest,
  AffiliateCredential,
  SaveCredentialInput,
} from "@/types";

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

// Affiliate Link API
export const affiliateLinkApi = {
  getAll: async (): Promise<AffiliateLink[]> => {
    return await invoke("get_all_affiliate_links");
  },

  getByProduct: async (productId: number): Promise<AffiliateLink[]> => {
    return await invoke("get_links_by_product", { productId });
  },

  discoverPrograms: async (
    productId: number
  ): Promise<AffiliateProgramDiscovery[]> => {
    return await invoke("discover_affiliate_programs", { productId });
  },

  generateLink: async (
    request: GenerateLinkRequest
  ): Promise<AffiliateLink> => {
    return await invoke("generate_affiliate_link", { request });
  },

  refreshLink: async (linkId: number): Promise<AffiliateLink> => {
    return await invoke("refresh_affiliate_link", { linkId });
  },

  deleteLink: async (id: number): Promise<void> => {
    return await invoke("delete_affiliate_link", { id });
  },

  generateForAllProducts: async (): Promise<AffiliateLink[]> => {
    return await invoke("generate_links_for_all_products");
  },

  generateForPlatform: async (
    request: GenerateLinkForPlatformRequest
  ): Promise<AffiliateLink> => {
    return await invoke("generate_link_for_platform", { request });
  },
};

// Credentials API
export const credentialsApi = {
  getAll: async (): Promise<AffiliateCredential[]> => {
    return await invoke("get_all_credentials");
  },

  getByPlatform: async (platform: string): Promise<AffiliateCredential | null> => {
    return await invoke("get_credential_by_platform", { platform });
  },

  save: async (input: SaveCredentialInput): Promise<AffiliateCredential> => {
    return await invoke("save_credential", { input });
  },

  delete: async (platform: string): Promise<void> => {
    return await invoke("delete_credential", { platform });
  },
};
