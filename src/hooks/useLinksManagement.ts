import { useReducer, useEffect, useCallback, useMemo } from "react";
import { affiliateLinkApi, productApi } from "@/services/api";
import type { AffiliateLink, Product } from "@/types";

/**
 * State shape - consolidated from 8 useState calls
 */
interface LinksState {
  links: AffiliateLink[];
  products: Product[];
  loading: boolean;
  error: string | null;
  generatingAll: boolean;
  generatingId: number | null;
  refreshingId: number | null;
  copiedId: number | null;
}

/**
 * Action types - explicit, type-safe actions for all state transitions
 */
type LinksAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_DATA"; payload: { links: AffiliateLink[]; products: Product[] } }
  | { type: "SET_GENERATING_ALL"; payload: boolean }
  | { type: "SET_GENERATING_ID"; payload: number | null }
  | { type: "SET_REFRESHING_ID"; payload: number | null }
  | { type: "SET_COPIED_ID"; payload: number | null }
  | { type: "CLEAR_COPIED" };

const initialState: LinksState = {
  links: [],
  products: [],
  loading: true,
  error: null,
  generatingAll: false,
  generatingId: null,
  refreshingId: null,
  copiedId: null,
};

/**
 * Reducer - centralized state transitions with predictable updates
 */
function linksReducer(state: LinksState, action: LinksAction): LinksState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_DATA":
      return {
        ...state,
        links: action.payload.links,
        products: action.payload.products,
        error: null,
      };
    case "SET_GENERATING_ALL":
      return { ...state, generatingAll: action.payload };
    case "SET_GENERATING_ID":
      return { ...state, generatingId: action.payload };
    case "SET_REFRESHING_ID":
      return { ...state, refreshingId: action.payload };
    case "SET_COPIED_ID":
      return { ...state, copiedId: action.payload };
    case "CLEAR_COPIED":
      return { ...state, copiedId: null };
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
 * Custom hook for affiliate links management.
 * Consolidates 8 useState calls into a single useReducer with typed actions.
 * Extracts all business logic from the component for better testability.
 */
export function useLinksManagement() {
  const [state, dispatch] = useReducer(linksReducer, initialState);

  // Load data from API
  const loadData = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const [linksData, productsData] = await Promise.all([
        affiliateLinkApi.getAll(),
        productApi.getAll(),
      ]);
      dispatch({ type: "SET_DATA", payload: { links: linksData, products: productsData } });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: getErrorMessage(err, "Failed to load affiliate links"),
      });
      console.error("Error loading data:", err);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Generate links for all products
  const generateAll = useCallback(async () => {
    dispatch({ type: "SET_GENERATING_ALL", payload: true });

    try {
      const newLinks = await affiliateLinkApi.generateForAllProducts();
      if (newLinks.length > 0) {
        await loadData();
      }
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: getErrorMessage(err, "Failed to generate links"),
      });
    } finally {
      dispatch({ type: "SET_GENERATING_ALL", payload: false });
    }
  }, [loadData]);

  // Generate link for a single product
  const generateSingle = useCallback(
    async (productId: number) => {
      dispatch({ type: "SET_GENERATING_ID", payload: productId });

      try {
        await affiliateLinkApi.generateLink({ product_id: productId });
        await loadData();
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: getErrorMessage(err, "Failed to generate link"),
        });
      } finally {
        dispatch({ type: "SET_GENERATING_ID", payload: null });
      }
    },
    [loadData]
  );

  // Refresh a link
  const refreshLink = useCallback(
    async (linkId: number) => {
      dispatch({ type: "SET_REFRESHING_ID", payload: linkId });

      try {
        await affiliateLinkApi.refreshLink(linkId);
        await loadData();
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: getErrorMessage(err, "Failed to refresh link"),
        });
      } finally {
        dispatch({ type: "SET_REFRESHING_ID", payload: null });
      }
    },
    [loadData]
  );

  // Copy link to clipboard
  const copyLink = useCallback(async (trackingUrl: string, linkId: number) => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      dispatch({ type: "SET_COPIED_ID", payload: linkId });

      // Auto-clear copied state after 2 seconds
      setTimeout(() => {
        dispatch({ type: "CLEAR_COPIED" });
      }, 2000);
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: getErrorMessage(err, "Failed to copy link"),
      });
    }
  }, []);

  // Delete a link
  const deleteLink = useCallback(
    async (linkId: number) => {
      if (!confirm("Are you sure you want to delete this affiliate link?")) {
        return;
      }

      try {
        await affiliateLinkApi.deleteLink(linkId);
        await loadData();
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: getErrorMessage(err, "Failed to delete link"),
        });
      }
    },
    [loadData]
  );

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Computed: products without links
  const productsWithoutLinks = useMemo(() => {
    return state.products.filter(
      (product) => !state.links.some((link) => link.product_id === product.id)
    );
  }, [state.products, state.links]);

  return {
    state,
    productsWithoutLinks,
    actions: {
      loadData,
      generateAll,
      generateSingle,
      refreshLink,
      copyLink,
      deleteLink,
    },
  };
}
