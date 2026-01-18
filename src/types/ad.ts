// Ad type enum matching Rust
export type AdType = 'social_post' | 'story' | 'video_script' | 'carousel' | 'email' | 'sms';

// Generated ad copy result
export interface GeneratedAdCopy {
  id?: number;
  product_id: number;
  ad_type: AdType;
  headline: string;
  body_text: string;
  cta: string;
  platform_specific_data?: Record<string, unknown>;
  performance_score?: number;
  created_at?: string;
}

// Request to generate ad
export interface GenerateAdRequest {
  product_id: number;
  ad_type?: AdType; // Optional - will auto-select if not provided
  custom_instructions?: string;
}

// Market analysis result
export interface MarketAnalysis {
  recommended_ad_type: AdType;
  confidence_score: number;
  reasoning: string;
  alternative_types: AdType[];
}

// Generation result with analysis
export interface AdGenerationResult {
  ad_copy: GeneratedAdCopy;
  market_analysis: MarketAnalysis;
}
