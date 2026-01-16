use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AffiliatePlatform {
    TikTokShop,
    InstagramShopping,
    AmazonAssociates,
    YouTubeShopping,
    PinterestBuyable,
    FacebookShops,
}

impl AffiliatePlatform {
    pub fn to_string(&self) -> String {
        match self {
            AffiliatePlatform::TikTokShop => "tiktok".to_string(),
            AffiliatePlatform::InstagramShopping => "instagram".to_string(),
            AffiliatePlatform::AmazonAssociates => "amazon".to_string(),
            AffiliatePlatform::YouTubeShopping => "youtube".to_string(),
            AffiliatePlatform::PinterestBuyable => "pinterest".to_string(),
            AffiliatePlatform::FacebookShops => "facebook".to_string(),
        }
    }

    pub fn from_string(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "tiktok" => Some(AffiliatePlatform::TikTokShop),
            "instagram" => Some(AffiliatePlatform::InstagramShopping),
            "amazon" => Some(AffiliatePlatform::AmazonAssociates),
            "youtube" => Some(AffiliatePlatform::YouTubeShopping),
            "pinterest" => Some(AffiliatePlatform::PinterestBuyable),
            "facebook" => Some(AffiliatePlatform::FacebookShops),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AffiliateLink {
    pub id: Option<i64>,
    pub product_id: i64,
    pub product_name: String,
    pub platform: String, // "tiktok", "instagram", "amazon", etc.
    pub program_name: String,
    pub commission_rate: Option<f64>,
    pub cookie_duration: Option<i32>,
    pub tracking_url: String,
    pub destination_url: String,
    pub status: String, // 'active', 'expired', 'invalid'
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateAffiliateLinkInput {
    pub product_id: i64,
    pub product_name: String,
    pub platform: String,
    pub program_name: String,
    pub commission_rate: Option<f64>,
    pub cookie_duration: Option<i32>,
    pub tracking_url: String,
    pub destination_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AffiliateProgramDiscovery {
    pub program_name: String,
    pub platform: AffiliatePlatform,
    pub commission_rate: f64,
    pub cookie_duration: i32,
    pub affiliate_url: String,
    pub is_official: bool,
    pub confidence_score: f64,
    pub audience_match_score: f64,
    pub recommendation_reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateLinkRequest {
    pub product_id: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateLinkForPlatformRequest {
    pub product_id: i64,
    pub platform: String,
}
