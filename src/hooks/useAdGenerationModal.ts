import { useReducer, useEffect, useCallback } from "react";
import type { Product } from "@/types";
import { adApi, type AdType, type AdGenerationResult, type GeneratedAdCopy } from "@/services/adApi";
import { toast } from "sonner";

// Types
export interface MarketAnalysis {
  recommendedAdType: string;
  confidence: number;
  reasoning: string;
}

export interface GeneratedAd {
  headline: string;
  body: string;
  cta: string;
  adType: string;
}

// State shape - consolidated from 11 useState calls into a single object
interface AdGenerationState {
  selectedAdType: AdType;
  customInstructions: string;
  isAnalyzing: boolean;
  isGenerating: boolean;
  marketAnalysis: MarketAnalysis | null;
  generatedAd: GeneratedAd | null;
  apiResult: AdGenerationResult | null;
  dropdownOpen: boolean;
  savedAds: GeneratedAdCopy[];
  showSavedAds: boolean;
}

// Action types - explicit, type-safe actions for all state transitions
type AdGenerationAction =
  | { type: "RESET" }
  | { type: "SET_ANALYZING"; payload: boolean }
  | { type: "SET_GENERATING"; payload: boolean }
  | { type: "SET_MARKET_ANALYSIS"; payload: MarketAnalysis | null }
  | { type: "SET_GENERATED_AD"; payload: GeneratedAd | null }
  | { type: "SET_API_RESULT"; payload: AdGenerationResult | null }
  | { type: "SET_AD_TYPE"; payload: AdType }
  | { type: "SET_CUSTOM_INSTRUCTIONS"; payload: string }
  | { type: "SET_SAVED_ADS"; payload: GeneratedAdCopy[] }
  | { type: "TOGGLE_DROPDOWN" }
  | { type: "CLOSE_DROPDOWN" }
  | { type: "TOGGLE_SAVED_ADS" };

const initialState: AdGenerationState = {
  selectedAdType: "social_post",
  customInstructions: "",
  isAnalyzing: false,
  isGenerating: false,
  marketAnalysis: null,
  generatedAd: null,
  apiResult: null,
  dropdownOpen: false,
  savedAds: [],
  showSavedAds: false,
};

// Reducer - centralized state transitions with predictable updates
function adGenerationReducer(state: AdGenerationState, action: AdGenerationAction): AdGenerationState {
  switch (action.type) {
    case "RESET":
      return { ...initialState };
    case "SET_ANALYZING":
      return { ...state, isAnalyzing: action.payload };
    case "SET_GENERATING":
      return { ...state, isGenerating: action.payload };
    case "SET_MARKET_ANALYSIS":
      return { ...state, marketAnalysis: action.payload };
    case "SET_GENERATED_AD":
      return { ...state, generatedAd: action.payload };
    case "SET_API_RESULT":
      return { ...state, apiResult: action.payload };
    case "SET_AD_TYPE":
      return { ...state, selectedAdType: action.payload, dropdownOpen: false };
    case "SET_CUSTOM_INSTRUCTIONS":
      return { ...state, customInstructions: action.payload };
    case "SET_SAVED_ADS":
      return { ...state, savedAds: action.payload };
    case "TOGGLE_DROPDOWN":
      return { ...state, dropdownOpen: !state.dropdownOpen };
    case "CLOSE_DROPDOWN":
      return { ...state, dropdownOpen: false };
    case "TOGGLE_SAVED_ADS":
      return { ...state, showSavedAds: !state.showSavedAds };
    default:
      return state;
  }
}

// Category-to-ad-type mapping for local fallback analysis
// Replaces nested if-else chains with a data-driven lookup
const CATEGORY_AD_RECOMMENDATIONS: Record<string, MarketAnalysis> = {
  tech: {
    recommendedAdType: "video_script",
    confidence: 87,
    reasoning: "Tech products perform best with video demonstrations showing features and benefits.",
  },
  electronic: {
    recommendedAdType: "video_script",
    confidence: 87,
    reasoning: "Tech products perform best with video demonstrations showing features and benefits.",
  },
  beauty: {
    recommendedAdType: "story",
    confidence: 92,
    reasoning: "Beauty products see highest conversion through stories and authentic testimonials.",
  },
  skincare: {
    recommendedAdType: "story",
    confidence: 92,
    reasoning: "Beauty products see highest conversion through stories and authentic testimonials.",
  },
  fitness: {
    recommendedAdType: "social_post",
    confidence: 85,
    reasoning: "Health and fitness products thrive on social platforms with community engagement.",
  },
  health: {
    recommendedAdType: "social_post",
    confidence: 85,
    reasoning: "Health and fitness products thrive on social platforms with community engagement.",
  },
  home: {
    recommendedAdType: "carousel",
    confidence: 78,
    reasoning: "Home products convert well through carousels showcasing multiple angles and use cases.",
  },
  kitchen: {
    recommendedAdType: "carousel",
    confidence: 78,
    reasoning: "Home products convert well through carousels showcasing multiple angles and use cases.",
  },
};

const DEFAULT_ANALYSIS: MarketAnalysis = {
  recommendedAdType: "social_post",
  confidence: 75,
  reasoning: "Social media posts provide broad reach and best ROI for this category.",
};

/**
 * Get local fallback market analysis based on product category.
 * Uses data-driven lookup instead of nested conditionals.
 */
function getLocalMarketAnalysis(product: Product): MarketAnalysis {
  const categoryLower = product.category.toLowerCase();

  for (const [keyword, analysis] of Object.entries(CATEGORY_AD_RECOMMENDATIONS)) {
    if (categoryLower.includes(keyword)) {
      return analysis;
    }
  }

  return DEFAULT_ANALYSIS;
}

/**
 * Transform API result to MarketAnalysis format
 */
function transformApiToMarketAnalysis(result: AdGenerationResult): MarketAnalysis {
  const { market_analysis } = result;
  return {
    recommendedAdType: market_analysis.recommended_ad_type,
    confidence: Math.round(market_analysis.estimated_engagement_score * 100),
    reasoning: `${market_analysis.suggested_tone} tone recommended for ${market_analysis.target_demographic}. Competition level: ${market_analysis.competition_level}. Key selling points: ${market_analysis.key_selling_points.slice(0, 2).join(", ")}.`,
  };
}

/**
 * Transform API result to GeneratedAd format
 */
function transformApiToGeneratedAd(result: AdGenerationResult, fallbackAdType: AdType): GeneratedAd {
  const { ad_copy } = result;
  return {
    headline: ad_copy.headline,
    body: ad_copy.body_text || "",
    cta: ad_copy.cta || "Shop Now",
    adType: ad_copy.ad_type || fallbackAdType,
  };
}

/**
 * Custom hook for ad generation modal logic.
 * Consolidates 11 useState calls into a single useReducer with clear actions.
 * Extracts all business logic from the component for better testability.
 */
export function useAdGenerationModal(product: Product | null, isOpen: boolean) {
  const [state, dispatch] = useReducer(adGenerationReducer, initialState);

  // Load previously saved ads for this product
  const loadSavedAds = useCallback(async () => {
    if (!product?.id) return;

    try {
      const ads = await adApi.getForProduct(product.id);
      dispatch({ type: "SET_SAVED_ADS", payload: ads });
    } catch (error) {
      console.error("Error loading saved ads:", error);
    }
  }, [product?.id]);

  // Analyze market by generating a preview ad
  const analyzeMarket = useCallback(async () => {
    if (!product?.id) return;

    dispatch({ type: "SET_ANALYZING", payload: true });

    try {
      const result = await adApi.generateForProduct(product.id);
      dispatch({ type: "SET_API_RESULT", payload: result });

      const analysis = transformApiToMarketAnalysis(result);
      dispatch({ type: "SET_MARKET_ANALYSIS", payload: analysis });
      dispatch({ type: "SET_AD_TYPE", payload: result.market_analysis.recommended_ad_type as AdType });
    } catch (error) {
      console.error("Error analyzing market:", error);
      // Fallback to local analysis if API fails
      const analysis = getLocalMarketAnalysis(product);
      dispatch({ type: "SET_MARKET_ANALYSIS", payload: analysis });
      dispatch({ type: "SET_AD_TYPE", payload: analysis.recommendedAdType as AdType });
    } finally {
      dispatch({ type: "SET_ANALYZING", payload: false });
    }
  }, [product]);

  // Generate ad content via API
  const generateAd = useCallback(async () => {
    if (!product?.id) return;

    dispatch({ type: "SET_GENERATING", payload: true });

    try {
      const result = await adApi.generateForProduct(
        product.id,
        state.selectedAdType,
        state.customInstructions || undefined
      );

      dispatch({ type: "SET_API_RESULT", payload: result });
      dispatch({
        type: "SET_GENERATED_AD",
        payload: transformApiToGeneratedAd(result, state.selectedAdType),
      });

      toast.success("Ad generated & saved!", {
        description: "Your ad has been saved automatically.",
      });

      // Reload saved ads to include the new one
      loadSavedAds();
    } catch (error) {
      console.error("Error generating ad:", error);
      toast.error("Failed to generate ad", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      dispatch({ type: "SET_GENERATING", payload: false });
    }
  }, [product?.id, state.selectedAdType, state.customInstructions, loadSavedAds]);

  // Reset and initialize when modal opens with a new product
  useEffect(() => {
    if (isOpen && product) {
      dispatch({ type: "RESET" });
      analyzeMarket();
      loadSavedAds();
    }
  }, [isOpen, product?.id, analyzeMarket, loadSavedAds]);

  // Action creators for cleaner component interface
  const actions = {
    setAdType: (adType: AdType) => dispatch({ type: "SET_AD_TYPE", payload: adType }),
    setCustomInstructions: (instructions: string) => dispatch({ type: "SET_CUSTOM_INSTRUCTIONS", payload: instructions }),
    toggleDropdown: () => dispatch({ type: "TOGGLE_DROPDOWN" }),
    closeDropdown: () => dispatch({ type: "CLOSE_DROPDOWN" }),
    toggleSavedAds: () => dispatch({ type: "TOGGLE_SAVED_ADS" }),
    generateAd,
    regenerateAd: generateAd,
  };

  return { state, actions };
}
