use crate::models::affiliate_link::{AffiliatePlatform, AffiliateProgramDiscovery};
use serde::{Deserialize, Serialize};

// AI Prompt Template for Affiliate Program Discovery (with platform awareness)
pub const AFFILIATE_DISCOVERY_PROMPT: &str = r#"You are an expert affiliate marketing analyst. Analyze the following product and discover the best affiliate program options across different platforms.

Product Information:
- Name: {product_name}
- Category: {category}
- Description: {description}
- Price Range: {price_range}
- Target Audience: {target_audience}
- Trending Score: {trending_score}

Your task:
1. Analyze the product metrics (target audience age, category, trending score, price)
2. Identify the TOP 3 PLATFORMS where this product will perform best
3. For each platform, find the best affiliate program
4. Score each platform's audience match (0.0-1.0) based on demographics
5. Consider platform-specific factors:
   - TikTok Shop: Viral potential, ages 18-35, trending products
   - Instagram Shopping: Visual appeal, ages 25-45, lifestyle fit
   - Amazon Associates: Broad reach, all ages, convenience
   - YouTube Shopping: Educational/reviews, ages 25-55, detailed products
   - Pinterest: Inspiration, ages 30-50, home/DIY/fashion

Return ONLY a valid JSON array with this structure:
[
  {{
    "program_name": "Platform Name + Program",
    "platform": "tiktok|instagram|amazon|youtube|pinterest",
    "commission_rate": 0.00,
    "cookie_duration": 30,
    "affiliate_url": "https://example.com/affiliate",
    "is_official": true,
    "confidence_score": 0.95,
    "audience_match_score": 0.90,
    "recommendation_reason": "Strong age match (18-25)"
  }}
]

Rules:
- Return maximum 5 platforms, sorted by audience_match_score
- audience_match_score weighted by age alignment (50%), category fit (25%), trending (15%), price (10%)
- Only include legitimate platforms
- NO explanatory text, ONLY the JSON array"#;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIRequest {
    pub prompt: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIResponse {
    pub programs: Vec<AffiliateProgramDiscovery>,
}

pub fn build_discovery_prompt(
    product_name: &str,
    category: &str,
    description: &str,
    price_range: &str,
    target_audience: &str,
    trending_score: i32,
) -> String {
    AFFILIATE_DISCOVERY_PROMPT
        .replace("{product_name}", product_name)
        .replace("{category}", category)
        .replace("{description}", description)
        .replace("{price_range}", price_range)
        .replace("{target_audience}", target_audience)
        .replace("{trending_score}", &trending_score.to_string())
}

pub fn parse_ai_response(response: &str) -> Result<Vec<AffiliateProgramDiscovery>, String> {
    let json_str = extract_json_array(response)?;
    serde_json::from_str(&json_str)
        .map_err(|e| format!("Failed to parse AI response: {}", e))
}

fn extract_json_array(text: &str) -> Result<String, String> {
    let start = text.find('[')
        .ok_or_else(|| "No JSON array found in response".to_string())?;
    let end = text.rfind(']')
        .ok_or_else(|| "No JSON array found in response".to_string())?;

    if start >= end {
        return Err("Invalid JSON array structure".to_string());
    }

    Ok(text[start..=end].to_string())
}

// Platform-aware mock AI discovery
pub fn mock_ai_discovery_with_platforms(
    product_name: &str,
    category: &str,
    trending_score: i32,
    target_audience: &str,
    price_range: &str,
) -> Vec<AffiliateProgramDiscovery> {
    let age_range = extract_age_range(target_audience);
    let price_tier = parse_price_tier(price_range);

    let mut programs = Vec::new();

    // Score each platform
    let platforms = vec![
        ("tiktok", AffiliatePlatform::TikTokShop),
        ("instagram", AffiliatePlatform::InstagramShopping),
        ("amazon", AffiliatePlatform::AmazonAssociates),
        ("youtube", AffiliatePlatform::YouTubeShopping),
        ("pinterest", AffiliatePlatform::PinterestBuyable),
    ];

    for (platform_str, platform_enum) in platforms {
        let score = calculate_platform_score(
            platform_str,
            category,
            trending_score,
            age_range,
            price_tier,
        );

        // Only include platforms with decent scores (> 0.3)
        if score > 0.3 {
            programs.push(create_program_for_platform(
                product_name,
                category,
                platform_str,
                platform_enum,
                score,
                age_range,
            ));
        }
    }

    // Sort by audience match score (descending)
    programs.sort_by(|a, b| {
        b.audience_match_score
            .partial_cmp(&a.audience_match_score)
            .unwrap_or(std::cmp::Ordering::Equal)
    });

    // Return top 5 platforms
    programs.into_iter().take(5).collect()
}

fn calculate_platform_score(
    platform: &str,
    category: &str,
    trending_score: i32,
    age_range: (i32, i32),
    price_tier: PriceTier,
) -> f64 {
    // WEIGHTED SCORING (50% age, 25% category, 15% trending, 10% price)
    let age_score = calculate_age_alignment(platform, age_range) * 0.50;
    let category_score = calculate_category_fit(platform, category) * 0.25;
    let trending_fit = calculate_trending_fit(platform, trending_score) * 0.15;
    let price_score = calculate_price_fit(platform, price_tier) * 0.10;

    age_score + category_score + trending_fit + price_score
}

fn calculate_age_alignment(platform: &str, age_range: (i32, i32)) -> f64 {
    let (min_age, max_age) = age_range;
    let avg_age = (min_age + max_age) / 2;

    // Platform ideal age ranges
    let score = match platform {
        "tiktok" => {
            // Ideal: 18-30
            if avg_age >= 18 && avg_age <= 30 {
                1.0
            } else if avg_age < 35 {
                0.8
            } else if avg_age < 40 {
                0.5
            } else {
                0.2
            }
        }
        "instagram" => {
            // Ideal: 22-40
            if avg_age >= 22 && avg_age <= 40 {
                1.0
            } else if avg_age >= 18 && avg_age <= 45 {
                0.8
            } else if avg_age < 50 {
                0.6
            } else {
                0.3
            }
        }
        "youtube" => {
            // Ideal: 25-55 (broad)
            if avg_age >= 25 && avg_age <= 55 {
                1.0
            } else if avg_age >= 18 {
                0.7
            } else {
                0.4
            }
        }
        "pinterest" => {
            // Ideal: 30-50
            if avg_age >= 30 && avg_age <= 50 {
                1.0
            } else if avg_age >= 25 && avg_age <= 55 {
                0.8
            } else {
                0.4
            }
        }
        "amazon" => {
            // Universal appeal
            0.9 // Always good baseline
        }
        _ => 0.5,
    };

    score
}

fn calculate_category_fit(platform: &str, category: &str) -> f64 {
    match platform {
        "tiktok" => match category {
            "Beauty & Skincare" | "Fashion & Apparel" => 1.0,
            "Health & Wellness" | "Fitness & Recovery" => 0.9,
            "Consumer Electronics" => 0.7,
            "Wearable Health Technology" => 0.8,
            _ => 0.5,
        },
        "instagram" => match category {
            "Beauty & Skincare" | "Fashion & Apparel" => 1.0,
            "Home & Kitchen" | "Health & Wellness" => 0.9,
            "Fitness & Recovery" => 0.8,
            _ => 0.6,
        },
        "youtube" => match category {
            "Consumer Electronics" | "Wearable Health Technology" => 1.0,
            "Fitness & Recovery" | "Health & Wellness" => 0.9,
            "Home & Kitchen" => 0.8,
            _ => 0.7,
        },
        "pinterest" => match category {
            "Home & Kitchen" | "Fashion & Apparel" => 1.0,
            "Beauty & Skincare" => 0.9,
            "Health & Wellness" => 0.8,
            _ => 0.6,
        },
        "amazon" => 1.0, // Universal
        _ => 0.5,
    }
}

fn calculate_trending_fit(platform: &str, trending_score: i32) -> f64 {
    match platform {
        "tiktok" => {
            // Needs high trending scores
            if trending_score >= 85 {
                1.0
            } else if trending_score >= 75 {
                0.8
            } else if trending_score >= 65 {
                0.5
            } else {
                0.3
            }
        }
        "instagram" => {
            // Moderately trending-dependent
            if trending_score >= 70 {
                1.0
            } else if trending_score >= 60 {
                0.8
            } else {
                0.6
            }
        }
        "youtube" | "pinterest" => {
            // Less dependent on trending
            if trending_score >= 60 {
                1.0
            } else {
                0.8
            }
        }
        "amazon" => 0.9, // Not trending-dependent
        _ => 0.5,
    }
}

fn calculate_price_fit(platform: &str, price_tier: PriceTier) -> f64 {
    match platform {
        "tiktok" => match price_tier {
            PriceTier::Low | PriceTier::Medium => 1.0,  // $10-$100
            PriceTier::High => 0.6,
            PriceTier::Premium => 0.3,
        },
        "instagram" => match price_tier {
            PriceTier::Low | PriceTier::Medium | PriceTier::High => 1.0, // $20-$300
            PriceTier::Premium => 0.7,
        },
        "youtube" => match price_tier {
            PriceTier::Medium | PriceTier::High | PriceTier::Premium => 1.0, // $50+
            PriceTier::Low => 0.7,
        },
        "pinterest" => match price_tier {
            PriceTier::Low | PriceTier::Medium => 1.0, // $15-$200
            PriceTier::High => 0.8,
            PriceTier::Premium => 0.5,
        },
        "amazon" => 1.0, // All price ranges
        _ => 0.5,
    }
}

fn create_program_for_platform(
    product_name: &str,
    category: &str,
    platform: &str,
    platform_enum: AffiliatePlatform,
    audience_match_score: f64,
    age_range: (i32, i32),
) -> AffiliateProgramDiscovery {
    let (commission_rate, cookie_duration, program_name, affiliate_url, is_official) = match platform {
        "tiktok" => (
            0.12,
            14,
            "TikTok Shop Creator Program".to_string(),
            format!("https://affiliate.tiktok.com/{}", product_name.to_lowercase().replace(" ", "-")),
            false,
        ),
        "instagram" => (
            0.15,
            30,
            format!("Instagram Shopping - {}", product_name),
            format!("https://business.instagram.com/shopping/{}", product_name.to_lowercase().replace(" ", "-")),
            false,
        ),
        "youtube" => (
            0.10,
            30,
            "YouTube Shopping Affiliate".to_string(),
            format!("https://shopping.youtube.com/products/{}", product_name.to_lowercase().replace(" ", "-")),
            false,
        ),
        "pinterest" => (
            0.13,
            30,
            "Pinterest Buyable Pins".to_string(),
            format!("https://business.pinterest.com/buyable/{}", product_name.to_lowercase().replace(" ", "-")),
            false,
        ),
        "amazon" => {
            // Vary commission by category
            let rate = match category {
                "Beauty & Skincare" | "Health & Wellness" => 0.10,
                "Fashion & Apparel" => 0.08,
                "Consumer Electronics" => 0.04,
                "Home & Kitchen" => 0.08,
                _ => 0.05,
            };
            (
                rate,
                24,
                "Amazon Associates".to_string(),
                "https://affiliate-program.amazon.com".to_string(),
                false,
            )
        }
        _ => (0.05, 30, "Generic Affiliate".to_string(), "https://example.com".to_string(), false),
    };

    let recommendation_reason = generate_recommendation_reason(platform, age_range, category);

    AffiliateProgramDiscovery {
        program_name,
        platform: platform_enum,
        commission_rate,
        cookie_duration,
        affiliate_url,
        is_official,
        confidence_score: 0.85 + (audience_match_score * 0.15), // Scale 0.85-1.0
        audience_match_score,
        recommendation_reason,
    }
}

fn generate_recommendation_reason(platform: &str, age_range: (i32, i32), category: &str) -> String {
    let (min, max) = age_range;
    match platform {
        "tiktok" => format!("Strong match for ages {}-{}, {} performs well on TikTok", min, max, category),
        "instagram" => format!("Ideal for ages {}-{}, visual platform for {}", min, max, category),
        "youtube" => format!("Great for ages {}-{}, detailed reviews boost {} sales", min, max, category),
        "pinterest" => format!("Perfect for ages {}-{}, discovery-driven for {}", min, max, category),
        "amazon" => format!("Universal platform for ages {}-{}, broad {} reach", min, max, category),
        _ => format!("Good match for ages {}-{}", min, max),
    }
}

// Helper to extract age range from target_audience string
fn extract_age_range(target_audience: &str) -> (i32, i32) {
    // Parse strings like "Age 18-35" or "Ages 30-50, female"
    let age_pattern = regex::Regex::new(r"(?i)age[s]?\s+(\d+)[-–]\s*(\d+)").ok();

    if let Some(re) = age_pattern {
        if let Some(caps) = re.captures(target_audience) {
            if let (Some(min), Some(max)) = (caps.get(1), caps.get(2)) {
                let min_age = min.as_str().parse::<i32>().unwrap_or(25);
                let max_age = max.as_str().parse::<i32>().unwrap_or(45);
                return (min_age, max_age);
            }
        }
    }

    // Default fallback
    (25, 45)
}

#[derive(Debug, Clone, Copy)]
enum PriceTier {
    Low,      // < $50
    Medium,   // $50-$150
    High,     // $150-$500
    Premium,  // > $500
}

fn parse_price_tier(price_range: &str) -> PriceTier {
    // Parse strings like "$30-$40" or "$300-400"
    let price_pattern = regex::Regex::new(r"\$?(\d+)").ok();

    if let Some(re) = price_pattern {
        if let Some(caps) = re.captures(price_range) {
            if let Some(price_match) = caps.get(1) {
                let price = price_match.as_str().parse::<i32>().unwrap_or(100);

                return if price < 50 {
                    PriceTier::Low
                } else if price < 150 {
                    PriceTier::Medium
                } else if price < 500 {
                    PriceTier::High
                } else {
                    PriceTier::Premium
                };
            }
        }
    }

    PriceTier::Medium // Default
}

// Generate platform-specific tracking URL
pub fn generate_tracking_url(
    platform: &str,
    program_name: &str,
    product_name: &str,
    destination_url: &str,
) -> String {
    let tracking_id = generate_tracking_id();
    let campaign = product_name.to_lowercase().replace(" ", "_");

    match platform {
        "tiktok" => format!(
            "{}?utm_source=tiktok&utm_medium=affiliate&utm_campaign={}&ref={}",
            destination_url, campaign, tracking_id
        ),
        "instagram" => format!(
            "{}?utm_source=instagram&utm_medium=shopping&utm_campaign={}&ref={}",
            destination_url, campaign, tracking_id
        ),
        "amazon" => format!(
            "https://www.amazon.com/dp/XXXXX?tag=affilai-20&linkCode=as2&ref={}",
            tracking_id
        ),
        "youtube" => format!(
            "{}?utm_source=youtube&utm_medium=affiliate&utm_campaign={}&ref={}",
            destination_url, campaign, tracking_id
        ),
        "pinterest" => format!(
            "{}?utm_source=pinterest&utm_medium=pin&utm_campaign={}&ref={}",
            destination_url, campaign, tracking_id
        ),
        _ => format!("{}?ref={}&utm_campaign={}", destination_url, tracking_id, campaign),
    }
}

fn generate_tracking_id() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis();
    format!("afl_{}", timestamp)
}

// Legacy function for backward compatibility
pub fn mock_ai_discovery(product_name: &str, category: &str) -> Vec<AffiliateProgramDiscovery> {
    // Call new function with defaults
    mock_ai_discovery_with_platforms(product_name, category, 70, "Age 25-45", "$50-$100")
}
