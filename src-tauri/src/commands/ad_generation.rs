use crate::database::get_connection;
use crate::models::product::Product;
use crate::services::ai_affiliate::mock_ai_discovery_with_platforms;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

/// Supported ad types for generation
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AdType {
    SocialPost,
    Story,
    VideoScript,
    Carousel,
    Email,
    Sms,
}

impl AdType {
    pub fn to_string(&self) -> String {
        match self {
            AdType::SocialPost => "social_post".to_string(),
            AdType::Story => "story".to_string(),
            AdType::VideoScript => "video_script".to_string(),
            AdType::Carousel => "carousel".to_string(),
            AdType::Email => "email".to_string(),
            AdType::Sms => "sms".to_string(),
        }
    }

    pub fn from_string(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "social_post" => Some(AdType::SocialPost),
            "story" => Some(AdType::Story),
            "video_script" => Some(AdType::VideoScript),
            "carousel" => Some(AdType::Carousel),
            "email" => Some(AdType::Email),
            "sms" => Some(AdType::Sms),
            _ => None,
        }
    }
}

/// Market analysis result from analyzing a product
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketAnalysis {
    pub recommended_ad_type: String,
    pub recommended_platform: String,
    pub target_demographic: String,
    pub key_selling_points: Vec<String>,
    pub suggested_tone: String,
    pub competition_level: String,
    pub estimated_engagement_score: f64,
}

/// A generated ad copy record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneratedAdCopy {
    pub id: Option<i64>,
    pub product_id: Option<i64>,
    pub campaign_id: i64,
    pub variation_name: Option<String>,
    pub headline: String,
    pub body_text: Option<String>,
    pub cta: Option<String>,
    pub ad_format: Option<String>,
    pub ad_type: Option<String>,
    pub platform_specific_data: Option<String>,
    pub performance_score: Option<f64>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

/// Result containing both the generated ad and market analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdGenerationResult {
    pub ad_copy: GeneratedAdCopy,
    pub market_analysis: MarketAnalysis,
}

/// Analyzes market for a product and returns recommendations
fn analyze_market_for_product(product: &Product) -> MarketAnalysis {
    let category = &product.category;
    let target_audience = product.target_audience.as_deref().unwrap_or("Age 25-45");
    let trending_score = product.trending_score.unwrap_or(50);
    let price_range = product.price_range.as_deref().unwrap_or("$50-$100");

    // Get platform recommendations
    let programs = mock_ai_discovery_with_platforms(
        &product.name,
        category,
        trending_score,
        target_audience,
        price_range,
    );

    let recommended_platform = programs
        .first()
        .map(|p| p.platform.to_string())
        .unwrap_or_else(|| "instagram".to_string());

    // Determine recommended ad type based on platform and category
    let recommended_ad_type = match recommended_platform.as_str() {
        "tiktok" => "video_script",
        "instagram" => {
            if category.contains("Fashion") || category.contains("Beauty") {
                "carousel"
            } else {
                "story"
            }
        }
        "youtube" => "video_script",
        "pinterest" => "carousel",
        "facebook" => "social_post",
        _ => "social_post",
    };

    // Extract key selling points based on category
    let key_selling_points = generate_selling_points(category, &product.name);

    // Determine tone based on target audience
    let suggested_tone = if target_audience.contains("18-25") || target_audience.contains("18-30") {
        "casual and trendy".to_string()
    } else if target_audience.contains("45") || target_audience.contains("50") {
        "professional and trustworthy".to_string()
    } else {
        "friendly and engaging".to_string()
    };

    // Competition level based on category
    let competition_level = match category.as_str() {
        "Beauty & Skincare" | "Fashion & Apparel" => "high".to_string(),
        "Consumer Electronics" | "Wearable Health Technology" => "medium".to_string(),
        "Health & Wellness" | "Fitness & Recovery" => "medium".to_string(),
        _ => "low".to_string(),
    };

    // Estimated engagement based on trending score and platform match
    let base_engagement = (trending_score as f64) / 100.0;
    let platform_boost = programs
        .first()
        .map(|p| p.audience_match_score)
        .unwrap_or(0.5);
    let estimated_engagement_score = (base_engagement * 0.6 + platform_boost * 0.4).min(1.0);

    MarketAnalysis {
        recommended_ad_type: recommended_ad_type.to_string(),
        recommended_platform,
        target_demographic: target_audience.to_string(),
        key_selling_points,
        suggested_tone,
        competition_level,
        estimated_engagement_score,
    }
}

/// Generate key selling points based on category
fn generate_selling_points(category: &str, product_name: &str) -> Vec<String> {
    match category {
        "Beauty & Skincare" => vec![
            "Clinically proven results".to_string(),
            "Natural, clean ingredients".to_string(),
            "Visible improvement in weeks".to_string(),
            format!("{} loved by thousands", product_name),
        ],
        "Health & Wellness" => vec![
            "Science-backed formula".to_string(),
            "Supports overall wellbeing".to_string(),
            "Easy to incorporate daily".to_string(),
            "Trusted by health experts".to_string(),
        ],
        "Fitness & Recovery" => vec![
            "Accelerate your recovery".to_string(),
            "Professional-grade quality".to_string(),
            "Used by athletes worldwide".to_string(),
            "See results faster".to_string(),
        ],
        "Consumer Electronics" | "Wearable Health Technology" => vec![
            "Cutting-edge technology".to_string(),
            "Seamless integration".to_string(),
            "Track your progress".to_string(),
            "Premium build quality".to_string(),
        ],
        "Fashion & Apparel" => vec![
            "Trendsetting style".to_string(),
            "Premium materials".to_string(),
            "Versatile for any occasion".to_string(),
            "Limited availability".to_string(),
        ],
        "Home & Kitchen" => vec![
            "Transform your space".to_string(),
            "Built to last".to_string(),
            "Saves time and effort".to_string(),
            "Top-rated by customers".to_string(),
        ],
        _ => vec![
            "Premium quality".to_string(),
            "Exceptional value".to_string(),
            "Customer favorite".to_string(),
            format!("Discover why {} is trending", product_name),
        ],
    }
}

/// Generate mock ad copy based on product and ad type
fn generate_ad_content(
    product: &Product,
    ad_type: &str,
    analysis: &MarketAnalysis,
    custom_instructions: Option<&str>,
) -> (String, String, String) {
    let name = &product.name;
    let category = &product.category;
    let description = product.description.as_deref().unwrap_or("");

    // Incorporate custom instructions into the tone if provided
    let tone_modifier = custom_instructions.unwrap_or("");

    let (headline, body, cta) = match ad_type {
        "social_post" => {
            let headline = format!("Transform your routine with {}", name);
            let body = format!(
                "Discover why everyone is talking about {}. {} {} #trending #musthave",
                name,
                description,
                if tone_modifier.is_empty() {
                    analysis.key_selling_points.first().cloned().unwrap_or_default()
                } else {
                    format!("{}", tone_modifier)
                }
            );
            let cta = "Shop Now".to_string();
            (headline, body, cta)
        }
        "story" => {
            let headline = format!("POV: You just discovered {}", name);
            let body = format!(
                "The {} that's breaking the internet. Swipe up before it sells out! {}",
                category.to_lowercase(),
                if tone_modifier.is_empty() { "" } else { tone_modifier }
            );
            let cta = "Swipe Up".to_string();
            (headline, body, cta)
        }
        "video_script" => {
            let headline = format!("STOP scrolling! You need to see this {}", category.to_lowercase());
            let body = format!(
                "[HOOK] Wait, you don't know about {} yet?\n\n\
                 [PROBLEM] Struggling with your {}?\n\n\
                 [SOLUTION] {} is the game-changer you've been waiting for.\n\n\
                 [BENEFITS]\n{}\n\n\
                 [CTA] Link in bio - but hurry, it's selling fast!{}",
                name,
                category.to_lowercase(),
                name,
                analysis.key_selling_points.iter()
                    .take(3)
                    .map(|p| format!("- {}", p))
                    .collect::<Vec<_>>()
                    .join("\n"),
                if tone_modifier.is_empty() { String::new() } else { format!("\n\n[NOTE] {}", tone_modifier) }
            );
            let cta = "Link in Bio".to_string();
            (headline, body, cta)
        }
        "carousel" => {
            let headline = format!("5 Reasons {} is a Must-Have", name);
            let body = format!(
                "Slide 1: Meet your new favorite {}\n\
                 Slide 2: {}\n\
                 Slide 3: {}\n\
                 Slide 4: {}\n\
                 Slide 5: Ready to transform your routine?\n\n\
                 {}",
                category.to_lowercase(),
                analysis.key_selling_points.get(0).cloned().unwrap_or_default(),
                analysis.key_selling_points.get(1).cloned().unwrap_or_default(),
                analysis.key_selling_points.get(2).cloned().unwrap_or_default(),
                if tone_modifier.is_empty() { "" } else { tone_modifier }
            );
            let cta = "Save for Later".to_string();
            (headline, body, cta)
        }
        "email" => {
            let headline = format!("You're going to love {} - Here's why", name);
            let body = format!(
                "Hi there,\n\n\
                 We noticed you've been looking for the perfect {}. Well, search no more!\n\n\
                 Introducing {} - {}\n\n\
                 What makes it special:\n{}\n\n\
                 Don't miss out on this opportunity to upgrade your routine.\n\n\
                 Best,\nThe Team{}",
                category.to_lowercase(),
                name,
                description,
                analysis.key_selling_points.iter()
                    .map(|p| format!("  - {}", p))
                    .collect::<Vec<_>>()
                    .join("\n"),
                if tone_modifier.is_empty() { String::new() } else { format!("\n\nP.S. {}", tone_modifier) }
            );
            let cta = "Shop Now".to_string();
            (headline, body, cta)
        }
        "sms" => {
            let headline = name.clone();
            let body = format!(
                "Hey! {} is finally back in stock. {} Get yours: [LINK]{}",
                name,
                analysis.key_selling_points.first().cloned().unwrap_or_default(),
                if tone_modifier.is_empty() { String::new() } else { format!(" {}", tone_modifier) }
            );
            let cta = "Reply STOP to unsubscribe".to_string();
            (headline, body, cta)
        }
        _ => {
            let headline = format!("Discover {}", name);
            let body = format!("{} - {}", name, description);
            let cta = "Learn More".to_string();
            (headline, body, cta)
        }
    };

    (headline, body, cta)
}

#[tauri::command]
pub async fn generate_ad_for_product(
    app_handle: AppHandle,
    product_id: i64,
    ad_type: Option<String>,
    custom_instructions: Option<String>,
) -> Result<AdGenerationResult, String> {
    // Step 1: Fetch the product by ID
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    let product = conn
        .query_row(
            "SELECT id, name, category, description, price_range, target_audience,
             trending_score, notes, image_url, amazon_asin, tiktok_product_id,
             instagram_product_id, youtube_video_id, pinterest_pin_id, product_url,
             created_at, updated_at
             FROM products WHERE id = ?1",
            params![product_id],
            |row| {
                Ok(Product {
                    id: Some(row.get(0)?),
                    name: row.get(1)?,
                    category: row.get(2)?,
                    description: row.get(3)?,
                    price_range: row.get(4)?,
                    target_audience: row.get(5)?,
                    trending_score: row.get(6)?,
                    notes: row.get(7)?,
                    image_url: row.get(8)?,
                    amazon_asin: row.get(9)?,
                    tiktok_product_id: row.get(10)?,
                    instagram_product_id: row.get(11)?,
                    youtube_video_id: row.get(12)?,
                    pinterest_pin_id: row.get(13)?,
                    product_url: row.get(14)?,
                    created_at: row.get(15)?,
                    updated_at: row.get(16)?,
                })
            },
        )
        .map_err(|e| format!("Product not found: {}", e))?;

    // Step 2: Analyze market for product
    let market_analysis = analyze_market_for_product(&product);

    // Step 3: Determine ad type (use provided or recommended)
    let final_ad_type = ad_type
        .as_deref()
        .unwrap_or(&market_analysis.recommended_ad_type);

    // Step 4: Generate ad content
    let (headline, body_text, cta) = generate_ad_content(
        &product,
        final_ad_type,
        &market_analysis,
        custom_instructions.as_deref(),
    );

    // Step 5: Save to ad_copies table
    // Note: campaign_id is required by schema, using 0 as placeholder for direct product ads
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    let variation_name = format!("{} - {} Ad", product.name, final_ad_type);
    let platform_data = serde_json::json!({
        "target_platform": market_analysis.recommended_platform,
        "suggested_tone": market_analysis.suggested_tone,
        "competition_level": market_analysis.competition_level,
    })
    .to_string();

    conn.execute(
        "INSERT INTO ad_copies (campaign_id, product_id, variation_name, headline, body_text,
         cta, ad_format, ad_type, platform_specific_data, performance_score)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            1, // default "Direct Product Ads" campaign (created in migration 007)
            product_id,
            variation_name,
            headline,
            body_text,
            cta,
            final_ad_type,
            final_ad_type,
            platform_data,
            market_analysis.estimated_engagement_score,
        ],
    )
    .map_err(|e| format!("Failed to save ad copy: {}", e))?;

    let id = conn.last_insert_rowid();

    // Fetch the created ad copy
    let ad_copy = conn
        .query_row(
            "SELECT id, product_id, campaign_id, variation_name, headline, body_text,
             cta, ad_format, ad_type, platform_specific_data, performance_score,
             created_at, updated_at
             FROM ad_copies WHERE id = ?1",
            params![id],
            |row| {
                Ok(GeneratedAdCopy {
                    id: Some(row.get(0)?),
                    product_id: row.get(1)?,
                    campaign_id: row.get(2)?,
                    variation_name: row.get(3)?,
                    headline: row.get(4)?,
                    body_text: row.get(5)?,
                    cta: row.get(6)?,
                    ad_format: row.get(7)?,
                    ad_type: row.get(8)?,
                    platform_specific_data: row.get(9)?,
                    performance_score: row.get(10)?,
                    created_at: row.get(11)?,
                    updated_at: row.get(12)?,
                })
            },
        )
        .map_err(|e| format!("Failed to retrieve created ad copy: {}", e))?;

    Ok(AdGenerationResult {
        ad_copy,
        market_analysis,
    })
}

#[tauri::command]
pub async fn get_ads_for_product(
    app_handle: AppHandle,
    product_id: i64,
) -> Result<Vec<GeneratedAdCopy>, String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, product_id, campaign_id, variation_name, headline, body_text,
             cta, ad_format, ad_type, platform_specific_data, performance_score,
             created_at, updated_at
             FROM ad_copies WHERE product_id = ?1 ORDER BY created_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let ads = stmt
        .query_map(params![product_id], |row| {
            Ok(GeneratedAdCopy {
                id: Some(row.get(0)?),
                product_id: row.get(1)?,
                campaign_id: row.get(2)?,
                variation_name: row.get(3)?,
                headline: row.get(4)?,
                body_text: row.get(5)?,
                cta: row.get(6)?,
                ad_format: row.get(7)?,
                ad_type: row.get(8)?,
                platform_specific_data: row.get(9)?,
                performance_score: row.get(10)?,
                created_at: row.get(11)?,
                updated_at: row.get(12)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(ads)
}
