// Product types
export interface Product {
  id?: number;
  name: string;
  category: string;
  description?: string;
  price_range?: string;
  target_audience?: string;
  trending_score?: number;
  notes?: string;
  image_url?: string;

  // Platform-specific product identifiers
  amazon_asin?: string;
  tiktok_product_id?: string;
  instagram_product_id?: string;
  youtube_video_id?: string;
  pinterest_pin_id?: string;
  product_url?: string;

  created_at?: string;
  updated_at?: string;
}

export interface CreateProductInput {
  name: string;
  category: string;
  description?: string;
  price_range?: string;
  target_audience?: string;
  trending_score?: number;
  notes?: string;
  image_url?: string;

  // Platform-specific product identifiers
  amazon_asin?: string;
  tiktok_product_id?: string;
  instagram_product_id?: string;
  youtube_video_id?: string;
  pinterest_pin_id?: string;
  product_url?: string;
}

export interface UpdateProductInput {
  id: number;
  name?: string;
  category?: string;
  description?: string;
  price_range?: string;
  target_audience?: string;
  trending_score?: number;
  notes?: string;
  image_url?: string;

  // Platform-specific product identifiers
  amazon_asin?: string;
  tiktok_product_id?: string;
  instagram_product_id?: string;
  youtube_video_id?: string;
  pinterest_pin_id?: string;
  product_url?: string;
}

// Product categories
export type ProductCategory =
  | "Wearable Health Technology"
  | "Beauty & Skincare"
  | "Fitness & Recovery"
  | "Home & Kitchen"
  | "Health & Wellness"
  | "Consumer Electronics"
  | "Fashion & Apparel"
  | "Home Entertainment";

// Affiliate Link types
export type AffiliatePlatform =
  | "tiktok"
  | "instagram"
  | "amazon"
  | "youtube"
  | "pinterest"
  | "facebook";

export interface AffiliateLink {
  id?: number;
  product_id: number;
  product_name: string;
  platform: string;
  program_name: string;
  commission_rate?: number;
  cookie_duration?: number;
  tracking_url: string;
  destination_url: string;
  status: "active" | "expired" | "invalid";
  created_at?: string;
  updated_at?: string;
}

export interface AffiliateProgramDiscovery {
  program_name: string;
  platform: string;
  commission_rate: number;
  cookie_duration: number;
  affiliate_url: string;
  is_official: boolean;
  confidence_score: number;
  audience_match_score: number;
  recommendation_reason: string;
}

export interface GenerateLinkRequest {
  product_id: number;
}

export interface GenerateLinkForPlatformRequest {
  product_id: number;
  platform: string;
}

// Affiliate Credentials types
export interface AffiliateCredential {
  id?: number;
  platform: string;
  affiliate_id?: string;
  shop_id?: string;
  account_name?: string;
  api_key?: string;
  api_secret?: string;
  active: boolean;
  verified: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SaveCredentialInput {
  platform: string;
  affiliate_id?: string;
  shop_id?: string;
  account_name?: string;
  api_key?: string;
  api_secret?: string;
  notes?: string;
}
