import { useReducer, useEffect, useCallback } from "react";
import { productApi } from "@/services/api";
import type { Product } from "@/types";

/**
 * State shape - consolidated from 7 useState calls
 */
interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  formOpen: boolean;
  editingProduct: Product | null;
  adModalOpen: boolean;
  selectedProductForAd: Product | null;
}

/**
 * Action types - explicit, type-safe actions
 */
type ProductsAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "OPEN_FORM"; payload: Product | null }
  | { type: "CLOSE_FORM" }
  | { type: "OPEN_AD_MODAL"; payload: Product }
  | { type: "CLOSE_AD_MODAL" };

const initialState: ProductsState = {
  products: [],
  loading: true,
  error: null,
  formOpen: false,
  editingProduct: null,
  adModalOpen: false,
  selectedProductForAd: null,
};

/**
 * Reducer - centralized state transitions
 */
function productsReducer(state: ProductsState, action: ProductsAction): ProductsState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_PRODUCTS":
      return { ...state, products: action.payload, error: null };
    case "OPEN_FORM":
      return { ...state, formOpen: true, editingProduct: action.payload };
    case "CLOSE_FORM":
      return { ...state, formOpen: false, editingProduct: null };
    case "OPEN_AD_MODAL":
      return { ...state, adModalOpen: true, selectedProductForAd: action.payload };
    case "CLOSE_AD_MODAL":
      return { ...state, adModalOpen: false };
    default:
      return state;
  }
}

/**
 * Helper to extract error message consistently
 */
function getErrorMessage(error: unknown, defaultMessage: string): string {
  return error instanceof Error ? error.message : defaultMessage;
}

/**
 * Custom hook for product management.
 * Consolidates 7 useState calls into a single useReducer with typed actions.
 */
export function useProductManagement() {
  const [state, dispatch] = useReducer(productsReducer, initialState);

  // Load products from API
  const loadProducts = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const data = await productApi.getAll();
      dispatch({ type: "SET_PRODUCTS", payload: data });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: getErrorMessage(err, "Failed to load products"),
      });
      console.error("Error loading products:", err);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Delete a product
  const deleteProduct = useCallback(
    async (id: number) => {
      if (!confirm("Are you sure you want to delete this product?")) return;

      try {
        await productApi.delete(id);
        await loadProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Failed to delete product");
      }
    },
    [loadProducts]
  );

  // Open form for adding new product
  const openAddForm = useCallback(() => {
    dispatch({ type: "OPEN_FORM", payload: null });
  }, []);

  // Open form for editing existing product
  const openEditForm = useCallback((product: Product) => {
    dispatch({ type: "OPEN_FORM", payload: product });
  }, []);

  // Close form
  const closeForm = useCallback(() => {
    dispatch({ type: "CLOSE_FORM" });
  }, []);

  // Set form open state (for controlled component)
  const setFormOpen = useCallback((open: boolean) => {
    if (!open) {
      dispatch({ type: "CLOSE_FORM" });
    }
  }, []);

  // Open ad generation modal
  const openAdModal = useCallback((product: Product) => {
    dispatch({ type: "OPEN_AD_MODAL", payload: product });
  }, []);

  // Close ad modal
  const closeAdModal = useCallback(() => {
    dispatch({ type: "CLOSE_AD_MODAL" });
  }, []);

  // Set ad modal open state (for controlled component)
  const setAdModalOpen = useCallback((open: boolean) => {
    if (!open) {
      dispatch({ type: "CLOSE_AD_MODAL" });
    }
  }, []);

  // Handle form success - reload products
  const handleFormSuccess = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    state,
    actions: {
      loadProducts,
      deleteProduct,
      openAddForm,
      openEditForm,
      closeForm,
      setFormOpen,
      openAdModal,
      closeAdModal,
      setAdModalOpen,
      handleFormSuccess,
    },
  };
}
