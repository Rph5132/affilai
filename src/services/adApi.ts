import { invoke } from "@tauri-apps/api/core";

// Ad type options for generation
export type AdType =
  | "social_post"
  | "story"
  | "video_script"
  | "carousel"
  | "email"
  | "sms";

// Market analysis result from analyzing a product
export interface MarketAnalysis {
  recommended_ad_type: string;
  recommended_platform: string;
  target_demographic: string;
  key_selling_points: string[];
  suggested_tone: string;
  competition_level: string;
  estimated_engagement_score: number;
}

// A generated ad copy record
export interface GeneratedAdCopy {
  id?: number;
  product_id?: number;
  campaign_id: number;
  variation_name?: string;
  headline: string;
  body_text?: string;
  cta?: string;
  ad_format?: string;
  ad_type?: string;
  platform_specific_data?: string;
  performance_score?: number;
  created_at?: string;
  updated_at?: string;
}

// Result containing both the generated ad and market analysis
export interface AdGenerationResult {
  ad_copy: GeneratedAdCopy;
  market_analysis: MarketAnalysis;
}

// Ad Generation API
export const adApi = {
  /**
   * Generate an ad for a specific product
   * @param productId - The ID of the product to generate an ad for
   * @param adType - Optional ad type (social_post, story, video_script, carousel, email, sms)
   * @param customInstructions - Optional custom instructions to influence ad generation
   * @returns The generated ad copy and market analysis
   */
  generateForProduct: (
    productId: number,
    adType?: AdType,
    customInstructions?: string
  ): Promise<AdGenerationResult> =>
    invoke<AdGenerationResult>("generate_ad_for_product", {
      productId,
      adType,
      customInstructions,
    }),

  /**
   * Get all generated ads for a specific product
   * @param productId - The ID of the product to get ads for
   * @returns Array of generated ad copies
   */
  getForProduct: (productId: number): Promise<GeneratedAdCopy[]> =>
    invoke<GeneratedAdCopy[]>("get_ads_for_product", { productId }),
};
