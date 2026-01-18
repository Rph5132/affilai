import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { AdType, AdGenerationResult, GenerateAdRequest } from "@/types/ad";

interface UseAdGenerationState {
  isGenerating: boolean;
  error: string | null;
  result: AdGenerationResult | null;
}

interface UseAdGenerationReturn extends UseAdGenerationState {
  generateAd: (productId: number, adType?: AdType, customInstructions?: string) => Promise<AdGenerationResult | null>;
  reset: () => void;
}

/**
 * React hook for generating ad copy using AI
 * Manages generation state, error handling, and results
 */
export function useAdGeneration(): UseAdGenerationReturn {
  const [state, setState] = useState<UseAdGenerationState>({
    isGenerating: false,
    error: null,
    result: null,
  });

  const generateAd = useCallback(
    async (
      productId: number,
      adType?: AdType,
      customInstructions?: string
    ): Promise<AdGenerationResult | null> => {
      setState((prev) => ({
        ...prev,
        isGenerating: true,
        error: null,
      }));

      try {
        const request: GenerateAdRequest = {
          product_id: productId,
          ad_type: adType,
          custom_instructions: customInstructions,
        };

        const result = await invoke<AdGenerationResult>("generate_ad_for_product", {
          request,
        });

        setState({
          isGenerating: false,
          error: null,
          result,
        });

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setState({
          isGenerating: false,
          error: errorMessage,
          result: null,
        });
        console.error("Error generating ad:", err);
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      error: null,
      result: null,
    });
  }, []);

  return {
    ...state,
    generateAd,
    reset,
  };
}
