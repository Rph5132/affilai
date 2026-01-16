use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AffiliateCredential {
    pub id: Option<i64>,
    pub platform: String,           // "amazon", "tiktok", "instagram", "youtube", "pinterest"
    pub affiliate_id: Option<String>, // Amazon Associate Tag, Creator ID, etc.
    pub shop_id: Option<String>,    // For TikTok/Instagram shops
    pub account_name: Option<String>, // Display name
    pub api_key: Option<String>,    // For future API integration
    pub api_secret: Option<String>,
    pub active: bool,
    pub verified: bool,             // Whether credentials have been tested
    pub notes: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SaveCredentialInput {
    pub platform: String,
    pub affiliate_id: Option<String>,
    pub shop_id: Option<String>,
    pub account_name: Option<String>,
    pub api_key: Option<String>,
    pub api_secret: Option<String>,
    pub notes: Option<String>,
}
