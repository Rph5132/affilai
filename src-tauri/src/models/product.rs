use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Product {
    pub id: Option<i64>,
    pub name: String,
    pub category: String,
    pub description: Option<String>,
    pub price_range: Option<String>,
    pub target_audience: Option<String>,
    pub trending_score: Option<i32>,
    pub notes: Option<String>,
    pub image_url: Option<String>,

    // Affiliate platform identifiers
    pub amazon_asin: Option<String>,
    pub tiktok_product_id: Option<String>,
    pub instagram_product_id: Option<String>,
    pub youtube_video_id: Option<String>,
    pub pinterest_pin_id: Option<String>,
    pub product_url: Option<String>,

    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateProductInput {
    pub name: String,
    pub category: String,
    pub description: Option<String>,
    pub price_range: Option<String>,
    pub target_audience: Option<String>,
    pub trending_score: Option<i32>,
    pub notes: Option<String>,
    pub image_url: Option<String>,

    // Affiliate platform identifiers
    pub amazon_asin: Option<String>,
    pub tiktok_product_id: Option<String>,
    pub instagram_product_id: Option<String>,
    pub youtube_video_id: Option<String>,
    pub pinterest_pin_id: Option<String>,
    pub product_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateProductInput {
    pub id: i64,
    pub name: Option<String>,
    pub category: Option<String>,
    pub description: Option<String>,
    pub price_range: Option<String>,
    pub target_audience: Option<String>,
    pub trending_score: Option<i32>,
    pub notes: Option<String>,
    pub image_url: Option<String>,

    // Affiliate platform identifiers
    pub amazon_asin: Option<String>,
    pub tiktok_product_id: Option<String>,
    pub instagram_product_id: Option<String>,
    pub youtube_video_id: Option<String>,
    pub pinterest_pin_id: Option<String>,
    pub product_url: Option<String>,
}
