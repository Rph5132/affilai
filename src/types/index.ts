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
