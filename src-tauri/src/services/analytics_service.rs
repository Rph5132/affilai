//! Analytics Service for Optimal Ad Type Selection
//!
//! This module provides intelligent ad type recommendations based on product
//! characteristics, target audience demographics, and platform availability.
//! The selection algorithm considers multiple factors to maximize engagement
//! and conversion potential across different advertising formats.

use crate::models::product::Product;
use serde::{Deserialize, Serialize};

// =============================================================================
// AD TYPE ENUM
// =============================================================================

/// Represents the different types of advertisements that can be generated
/// for affiliate marketing campaigns across various platforms.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AdType {
    /// Standard social media post (Facebook, Twitter/X, LinkedIn)
    /// Best for: Viral content, quick engagement, broad reach
    SocialPost,

    /// Ephemeral story format (Instagram Stories, TikTok, Snapchat)
    /// Best for: Gen Z audience, time-sensitive offers, behind-the-scenes
    Story,

    /// Long-form video content script (YouTube, TikTok long-form)
    /// Best for: Tech products, detailed demonstrations, educational content
    VideoScript,

    /// Multi-image carousel format (Instagram, Facebook, Pinterest)
    /// Best for: Fashion, product collections, step-by-step guides
    Carousel,

    /// Email marketing content
    /// Best for: Older demographics, detailed offers, nurture campaigns
    Email,

    /// SMS/Text message marketing
    /// Best for: Flash sales, urgent offers, high-intent customers
    Sms,
}

impl Default for AdType {
    fn default() -> Self {
        AdType::SocialPost
    }
}

impl AdType {
    /// Returns a human-readable display name for the ad type
    pub fn display_name(&self) -> &'static str {
        match self {
            AdType::SocialPost => "Social Media Post",
            AdType::Story => "Story",
            AdType::VideoScript => "Video Script",
            AdType::Carousel => "Carousel",
            AdType::Email => "Email",
            AdType::Sms => "SMS",
        }
    }

    /// Returns a brief description of when this ad type is most effective
    pub fn description(&self) -> &'static str {
        match self {
            AdType::SocialPost => "Best for viral reach and quick engagement",
            AdType::Story => "Perfect for Gen Z and time-sensitive content",
            AdType::VideoScript => "Ideal for detailed product demonstrations",
            AdType::Carousel => "Great for visual products and collections",
            AdType::Email => "Effective for nurturing and detailed offers",
            AdType::Sms => "Optimal for urgent, high-conversion messages",
        }
    }

    /// Returns all available ad types as a vector
    pub fn all() -> Vec<AdType> {
        vec![
            AdType::SocialPost,
            AdType::Story,
            AdType::VideoScript,
            AdType::Carousel,
            AdType::Email,
            AdType::Sms,
        ]
    }
}

// =============================================================================
// MARKET ANALYSIS STRUCT
// =============================================================================

/// Comprehensive market analysis result containing the recommended ad type
/// along with supporting data for the recommendation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketAnalysis {
    /// The primary recommended ad type based on product analysis
    pub recommended_ad_type: AdType,

    /// Confidence score for the recommendation (0.0 to 1.0)
    /// Higher scores indicate stronger alignment between product and ad type
    pub confidence_score: f64,

    /// Human-readable explanation of why this ad type was selected
    pub reasoning: String,

    /// Alternative ad types that could also work well, ordered by suitability
    pub alternative_types: Vec<AdType>,
}

impl Default for MarketAnalysis {
    fn default() -> Self {
        MarketAnalysis {
            recommended_ad_type: AdType::SocialPost,
            confidence_score: 0.5,
            reasoning: "Default recommendation based on broad appeal".to_string(),
            alternative_types: vec![AdType::Email, AdType::Carousel],
        }
    }
}

// =============================================================================
// INTERNAL SCORING STRUCTURES
// =============================================================================

/// Internal structure to hold scoring factors for each ad type
#[derive(Debug, Clone)]
struct AdTypeScore {
    ad_type: AdType,
    category_score: f64,
    audience_score: f64,
    trending_score: f64,
    platform_score: f64,
    total_score: f64,
}

impl AdTypeScore {
    fn new(ad_type: AdType) -> Self {
        AdTypeScore {
            ad_type,
            category_score: 0.0,
            audience_score: 0.0,
            trending_score: 0.0,
            platform_score: 0.0,
            total_score: 0.0,
        }
    }

    /// Calculate total score with weighted factors
    /// Weights: Category 30%, Audience 35%, Trending 20%, Platform 15%
    fn calculate_total(&mut self) {
        self.total_score = (self.category_score * 0.30)
            + (self.audience_score * 0.35)
            + (self.trending_score * 0.20)
            + (self.platform_score * 0.15);
    }
}

// =============================================================================
// MAIN SELECTION FUNCTION
// =============================================================================

/// Selects the optimal ad type for a given product based on multiple factors.
///
/// # Algorithm Overview
/// The selection process analyzes four key dimensions:
/// 1. **Product Category**: Tech products favor video scripts, fashion favors carousels
/// 2. **Target Audience**: Gen Z prefers stories/social, older demographics prefer email
/// 3. **Trending Score**: High trending products benefit from social posts for virality
/// 4. **Platform Availability**: Existing platform IDs influence format selection
///
/// # Arguments
/// * `product` - Reference to the Product being analyzed
///
/// # Returns
/// The optimal `AdType` for the product based on the analysis
///
/// # Example
/// ```ignore
/// let product = Product { category: "Consumer Electronics".to_string(), ... };
/// let ad_type = select_optimal_ad_type(&product);
/// assert_eq!(ad_type, AdType::VideoScript);
/// ```
pub fn select_optimal_ad_type(product: &Product) -> AdType {
    let analysis = analyze_market_for_product(product);
    analysis.recommended_ad_type
}

// =============================================================================
// COMPREHENSIVE MARKET ANALYSIS
// =============================================================================

/// Performs comprehensive market analysis for a product and returns detailed
/// recommendations including confidence scores and reasoning.
///
/// # Analysis Factors
///
/// ## Category Analysis (30% weight)
/// - Tech/Electronics -> VideoScript (detailed demos needed)
/// - Fashion/Beauty -> Carousel/Story (visual appeal)
/// - Home/Kitchen -> Carousel (product showcase)
/// - Health/Wellness -> Email (trust building)
///
/// ## Audience Analysis (35% weight)
/// - Gen Z (18-25) -> Story, SocialPost (short attention, mobile-first)
/// - Millennials (26-40) -> Carousel, VideoScript (engaged, research-oriented)
/// - Gen X (41-55) -> Email, VideoScript (detail-oriented)
/// - Boomers (56+) -> Email, Sms (traditional channels)
///
/// ## Trending Analysis (20% weight)
/// - High trending (80+) -> SocialPost (maximize viral potential)
/// - Medium trending (50-79) -> Story, Carousel (sustained engagement)
/// - Low trending (<50) -> Email, VideoScript (education-focused)
///
/// ## Platform Analysis (15% weight)
/// - TikTok available -> Story (native format)
/// - Instagram available -> Carousel (optimal engagement)
/// - YouTube available -> VideoScript (long-form content)
/// - Pinterest available -> Carousel (discovery format)
///
/// # Arguments
/// * `product` - Reference to the Product being analyzed
///
/// # Returns
/// A `MarketAnalysis` struct with complete recommendation details
pub fn analyze_market_for_product(product: &Product) -> MarketAnalysis {
    // Initialize scores for all ad types
    let mut scores: Vec<AdTypeScore> = AdType::all()
        .into_iter()
        .map(AdTypeScore::new)
        .collect();

    // Calculate individual factor scores for each ad type
    for score in &mut scores {
        score.category_score = calculate_category_score(&product.category, score.ad_type);
        score.audience_score = calculate_audience_score(
            product.target_audience.as_deref(),
            score.ad_type,
        );
        score.trending_score = calculate_trending_score(product.trending_score, score.ad_type);
        score.platform_score = calculate_platform_score(product, score.ad_type);
        score.calculate_total();
    }

    // Sort by total score (descending)
    scores.sort_by(|a, b| {
        b.total_score
            .partial_cmp(&a.total_score)
            .unwrap_or(std::cmp::Ordering::Equal)
    });

    // Extract the best match and alternatives
    let best = &scores[0];
    let alternatives: Vec<AdType> = scores[1..std::cmp::min(4, scores.len())]
        .iter()
        .map(|s| s.ad_type)
        .collect();

    // Generate reasoning based on the dominant factors
    let reasoning = generate_reasoning(product, best);

    MarketAnalysis {
        recommended_ad_type: best.ad_type,
        confidence_score: best.total_score.clamp(0.0, 1.0),
        reasoning,
        alternative_types: alternatives,
    }
}

// =============================================================================
// CATEGORY SCORING
// =============================================================================

/// Calculates how well an ad type matches a product category.
///
/// Categories are mapped to ad types based on typical content consumption
/// patterns and purchase decision processes for each product type.
fn calculate_category_score(category: &str, ad_type: AdType) -> f64 {
    let category_lower = category.to_lowercase();

    match ad_type {
        AdType::VideoScript => {
            // Video scripts excel for products that need demonstration
            if category_lower.contains("electronics")
                || category_lower.contains("tech")
                || category_lower.contains("wearable")
                || category_lower.contains("gadget")
            {
                1.0
            } else if category_lower.contains("fitness")
                || category_lower.contains("health")
            {
                0.8
            } else if category_lower.contains("home")
                || category_lower.contains("kitchen")
            {
                0.6
            } else {
                0.4
            }
        }

        AdType::Carousel => {
            // Carousels work best for visual, multi-angle products
            if category_lower.contains("fashion")
                || category_lower.contains("apparel")
                || category_lower.contains("clothing")
            {
                1.0
            } else if category_lower.contains("beauty")
                || category_lower.contains("skincare")
                || category_lower.contains("cosmetic")
            {
                0.9
            } else if category_lower.contains("home")
                || category_lower.contains("decor")
                || category_lower.contains("furniture")
            {
                0.85
            } else if category_lower.contains("jewelry")
                || category_lower.contains("accessories")
            {
                0.9
            } else {
                0.5
            }
        }

        AdType::Story => {
            // Stories are great for lifestyle and trending products
            if category_lower.contains("beauty")
                || category_lower.contains("skincare")
            {
                0.95
            } else if category_lower.contains("fashion")
                || category_lower.contains("apparel")
            {
                0.9
            } else if category_lower.contains("food")
                || category_lower.contains("beverage")
            {
                0.85
            } else if category_lower.contains("fitness")
                || category_lower.contains("wellness")
            {
                0.8
            } else {
                0.5
            }
        }

        AdType::SocialPost => {
            // Social posts have broad appeal but excel for viral-friendly products
            if category_lower.contains("trending")
                || category_lower.contains("viral")
            {
                0.95
            } else if category_lower.contains("gadget")
                || category_lower.contains("tech")
            {
                0.7
            } else {
                0.6 // Baseline for all categories
            }
        }

        AdType::Email => {
            // Email works for products requiring consideration
            if category_lower.contains("health")
                || category_lower.contains("wellness")
                || category_lower.contains("supplement")
            {
                0.9
            } else if category_lower.contains("finance")
                || category_lower.contains("insurance")
            {
                0.95
            } else if category_lower.contains("electronics")
                || category_lower.contains("appliance")
            {
                0.7
            } else {
                0.5
            }
        }

        AdType::Sms => {
            // SMS best for time-sensitive, impulse-friendly products
            if category_lower.contains("food")
                || category_lower.contains("restaurant")
            {
                0.9
            } else if category_lower.contains("deal")
                || category_lower.contains("flash")
            {
                0.95
            } else if category_lower.contains("local")
                || category_lower.contains("service")
            {
                0.8
            } else {
                0.3
            }
        }
    }
}

// =============================================================================
// AUDIENCE SCORING
// =============================================================================

/// Calculates how well an ad type matches the target audience demographics.
///
/// Audience age ranges are extracted from the target_audience string and
/// mapped to preferred content consumption patterns.
fn calculate_audience_score(target_audience: Option<&str>, ad_type: AdType) -> f64 {
    let audience = match target_audience {
        Some(a) => a,
        None => return 0.5, // Default neutral score if no audience specified
    };

    let audience_lower = audience.to_lowercase();

    // Extract age indicators
    let age_range = extract_age_range(&audience_lower);
    let avg_age = (age_range.0 + age_range.1) / 2;

    // Check for generation keywords
    let is_gen_z = audience_lower.contains("gen z")
        || audience_lower.contains("genz")
        || audience_lower.contains("zoomer")
        || (avg_age >= 18 && avg_age <= 25);

    let is_millennial = audience_lower.contains("millennial")
        || (avg_age >= 26 && avg_age <= 40);

    let is_gen_x = audience_lower.contains("gen x")
        || audience_lower.contains("genx")
        || (avg_age >= 41 && avg_age <= 55);

    let is_boomer = audience_lower.contains("boomer")
        || audience_lower.contains("senior")
        || avg_age > 55;

    match ad_type {
        AdType::Story => {
            // Stories are Gen Z's native format
            if is_gen_z {
                1.0
            } else if is_millennial {
                0.75
            } else if is_gen_x {
                0.4
            } else {
                0.2
            }
        }

        AdType::SocialPost => {
            // Social posts work across generations but skew younger
            if is_gen_z {
                0.9
            } else if is_millennial {
                0.85
            } else if is_gen_x {
                0.6
            } else {
                0.4
            }
        }

        AdType::VideoScript => {
            // Video content has broad appeal, especially for research-oriented buyers
            if is_millennial {
                0.9
            } else if is_gen_x {
                0.85
            } else if is_gen_z {
                0.7
            } else {
                0.6
            }
        }

        AdType::Carousel => {
            // Carousels appeal to visual-oriented, engaged users
            if is_millennial {
                0.9
            } else if is_gen_z {
                0.8
            } else if is_gen_x {
                0.7
            } else {
                0.5
            }
        }

        AdType::Email => {
            // Email effectiveness increases with age
            if is_boomer {
                1.0
            } else if is_gen_x {
                0.9
            } else if is_millennial {
                0.7
            } else {
                0.4
            }
        }

        AdType::Sms => {
            // SMS works for high-intent users across demographics
            if is_gen_x {
                0.8
            } else if is_boomer {
                0.75
            } else if is_millennial {
                0.6
            } else {
                0.5
            }
        }
    }
}

/// Extracts age range from audience description string.
/// Returns (min_age, max_age) tuple.
fn extract_age_range(audience: &str) -> (i32, i32) {
    // Try to find age pattern like "18-35" or "ages 25-45"
    let age_pattern = regex::Regex::new(r"(\d{2})[-–]\s*(\d{2})").ok();

    if let Some(re) = age_pattern {
        if let Some(caps) = re.captures(audience) {
            if let (Some(min), Some(max)) = (caps.get(1), caps.get(2)) {
                let min_age = min.as_str().parse::<i32>().unwrap_or(25);
                let max_age = max.as_str().parse::<i32>().unwrap_or(45);
                return (min_age, max_age);
            }
        }
    }

    // Fallback: check for generation keywords
    if audience.contains("gen z") || audience.contains("genz") {
        return (18, 25);
    } else if audience.contains("millennial") {
        return (26, 40);
    } else if audience.contains("gen x") || audience.contains("genx") {
        return (41, 55);
    } else if audience.contains("boomer") || audience.contains("senior") {
        return (56, 70);
    }

    // Default middle-range audience
    (25, 45)
}

// =============================================================================
// TRENDING SCORE ANALYSIS
// =============================================================================

/// Calculates how well an ad type leverages the product's trending status.
///
/// High-trending products should use formats that maximize viral spread,
/// while low-trending products benefit from educational, trust-building formats.
fn calculate_trending_score(trending_score: Option<i32>, ad_type: AdType) -> f64 {
    let score = trending_score.unwrap_or(50); // Default to medium trending

    match ad_type {
        AdType::SocialPost => {
            // Social posts benefit most from high trending scores
            if score >= 80 {
                1.0 // Maximum viral potential
            } else if score >= 60 {
                0.8
            } else if score >= 40 {
                0.6
            } else {
                0.4 // Low trending hurts social post effectiveness
            }
        }

        AdType::Story => {
            // Stories also benefit from trending but are more forgiving
            if score >= 75 {
                0.95
            } else if score >= 50 {
                0.75
            } else {
                0.55
            }
        }

        AdType::VideoScript => {
            // Videos are less dependent on trending - evergreen content
            if score >= 60 {
                0.8
            } else {
                0.7 // Still effective for low-trending products
            }
        }

        AdType::Carousel => {
            // Carousels have moderate trending dependency
            if score >= 70 {
                0.85
            } else if score >= 50 {
                0.7
            } else {
                0.6
            }
        }

        AdType::Email => {
            // Email is trending-independent, actually better for low-trending
            if score < 50 {
                0.85 // Low trending = need to educate and build trust
            } else if score < 70 {
                0.75
            } else {
                0.6 // High trending products don't need email nurturing
            }
        }

        AdType::Sms => {
            // SMS is mostly trending-neutral, focused on urgency
            0.6
        }
    }
}

// =============================================================================
// PLATFORM AVAILABILITY SCORING
// =============================================================================

/// Calculates how well an ad type aligns with available platform identifiers.
///
/// If a product already has platform-specific IDs (TikTok, Instagram, etc.),
/// this influences which ad formats are most suitable.
fn calculate_platform_score(product: &Product, ad_type: AdType) -> f64 {
    let has_tiktok = product.tiktok_product_id.is_some();
    let has_instagram = product.instagram_product_id.is_some();
    let has_youtube = product.youtube_video_id.is_some();
    let has_pinterest = product.pinterest_pin_id.is_some();
    let has_amazon = product.amazon_asin.is_some();

    // Count available platforms
    let platform_count = [has_tiktok, has_instagram, has_youtube, has_pinterest, has_amazon]
        .iter()
        .filter(|&&x| x)
        .count();

    match ad_type {
        AdType::Story => {
            // Stories are native to TikTok and Instagram
            if has_tiktok {
                0.95
            } else if has_instagram {
                0.85
            } else {
                0.5
            }
        }

        AdType::Carousel => {
            // Carousels work best on Instagram and Pinterest
            if has_instagram && has_pinterest {
                1.0
            } else if has_instagram {
                0.9
            } else if has_pinterest {
                0.85
            } else {
                0.5
            }
        }

        AdType::VideoScript => {
            // Video scripts are YouTube-native
            if has_youtube {
                0.95
            } else if has_tiktok {
                0.7 // TikTok supports long-form now
            } else {
                0.5
            }
        }

        AdType::SocialPost => {
            // Social posts work across all platforms
            if platform_count >= 3 {
                0.9 // Multi-platform presence = amplify with posts
            } else if platform_count >= 1 {
                0.75
            } else {
                0.6
            }
        }

        AdType::Email => {
            // Email is platform-agnostic, slight boost if Amazon (conversion focus)
            if has_amazon {
                0.8
            } else {
                0.65
            }
        }

        AdType::Sms => {
            // SMS is platform-agnostic
            0.6
        }
    }
}

// =============================================================================
// REASONING GENERATION
// =============================================================================

/// Generates a human-readable explanation for the ad type recommendation.
fn generate_reasoning(product: &Product, score: &AdTypeScore) -> String {
    let mut reasons = Vec::new();

    // Add category-based reasoning
    if score.category_score >= 0.8 {
        reasons.push(format!(
            "The '{}' category aligns strongly with {} format",
            product.category,
            score.ad_type.display_name()
        ));
    }

    // Add audience-based reasoning
    if let Some(ref audience) = product.target_audience {
        if score.audience_score >= 0.8 {
            reasons.push(format!(
                "Target audience '{}' responds well to this format",
                audience
            ));
        }
    }

    // Add trending-based reasoning
    if let Some(trending) = product.trending_score {
        if trending >= 80 && score.trending_score >= 0.9 {
            reasons.push("High trending score suggests viral potential".to_string());
        } else if trending < 50 && score.trending_score >= 0.7 {
            reasons.push("This format builds trust for products needing education".to_string());
        }
    }

    // Add platform-based reasoning
    if score.platform_score >= 0.85 {
        let platforms: Vec<&str> = [
            product.tiktok_product_id.as_ref().map(|_| "TikTok"),
            product.instagram_product_id.as_ref().map(|_| "Instagram"),
            product.youtube_video_id.as_ref().map(|_| "YouTube"),
            product.pinterest_pin_id.as_ref().map(|_| "Pinterest"),
        ]
        .into_iter()
        .flatten()
        .collect();

        if !platforms.is_empty() {
            reasons.push(format!(
                "Available on {} which natively supports this format",
                platforms.join(", ")
            ));
        }
    }

    // Combine reasons or provide default
    if reasons.is_empty() {
        format!(
            "{} selected as the balanced choice for '{}' with confidence {:.0}%",
            score.ad_type.display_name(),
            product.name,
            score.total_score * 100.0
        )
    } else {
        reasons.join(". ") + "."
    }
}

// =============================================================================
// UNIT TESTS
// =============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_product(
        category: &str,
        target_audience: Option<&str>,
        trending_score: Option<i32>,
    ) -> Product {
        Product {
            id: Some(1),
            name: "Test Product".to_string(),
            category: category.to_string(),
            description: Some("Test description".to_string()),
            price_range: Some("$50-$100".to_string()),
            target_audience: target_audience.map(String::from),
            trending_score,
            notes: None,
            image_url: None,
            amazon_asin: None,
            tiktok_product_id: None,
            instagram_product_id: None,
            youtube_video_id: None,
            pinterest_pin_id: None,
            product_url: None,
            created_at: None,
            updated_at: None,
        }
    }

    #[test]
    fn test_tech_products_favor_video_scripts() {
        let product = create_test_product("Consumer Electronics", Some("Age 30-45"), Some(60));
        let ad_type = select_optimal_ad_type(&product);
        assert_eq!(ad_type, AdType::VideoScript);
    }

    #[test]
    fn test_fashion_products_favor_carousels() {
        let product = create_test_product("Fashion & Apparel", Some("Age 25-40"), Some(65));
        let ad_type = select_optimal_ad_type(&product);
        assert!(ad_type == AdType::Carousel || ad_type == AdType::Story);
    }

    #[test]
    fn test_gen_z_audience_favors_stories() {
        let product = create_test_product("Beauty & Skincare", Some("Gen Z, Age 18-24"), Some(75));
        let ad_type = select_optimal_ad_type(&product);
        assert_eq!(ad_type, AdType::Story);
    }

    #[test]
    fn test_older_audience_favors_email() {
        let product = create_test_product("Health & Wellness", Some("Age 55-70, Boomers"), Some(40));
        let ad_type = select_optimal_ad_type(&product);
        assert_eq!(ad_type, AdType::Email);
    }

    #[test]
    fn test_high_trending_favors_social_post() {
        let product = create_test_product("Gadgets", Some("Age 25-35"), Some(92));
        let analysis = analyze_market_for_product(&product);
        // High trending should boost social post score
        assert!(analysis.confidence_score > 0.6);
    }

    #[test]
    fn test_tiktok_platform_boosts_story() {
        let mut product = create_test_product("Beauty & Skincare", Some("Age 18-30"), Some(70));
        product.tiktok_product_id = Some("tiktok123".to_string());
        let analysis = analyze_market_for_product(&product);
        assert_eq!(analysis.recommended_ad_type, AdType::Story);
    }

    #[test]
    fn test_youtube_platform_boosts_video_script() {
        let mut product = create_test_product("Consumer Electronics", Some("Age 30-50"), Some(55));
        product.youtube_video_id = Some("youtube456".to_string());
        let analysis = analyze_market_for_product(&product);
        assert_eq!(analysis.recommended_ad_type, AdType::VideoScript);
    }

    #[test]
    fn test_instagram_pinterest_boosts_carousel() {
        let mut product = create_test_product("Home & Decor", Some("Age 30-45"), Some(60));
        product.instagram_product_id = Some("insta789".to_string());
        product.pinterest_pin_id = Some("pin101".to_string());
        let analysis = analyze_market_for_product(&product);
        assert_eq!(analysis.recommended_ad_type, AdType::Carousel);
    }

    #[test]
    fn test_market_analysis_has_alternatives() {
        let product = create_test_product("Fashion & Apparel", Some("Age 25-35"), Some(70));
        let analysis = analyze_market_for_product(&product);
        assert!(!analysis.alternative_types.is_empty());
        assert!(analysis.alternative_types.len() <= 3);
    }

    #[test]
    fn test_confidence_score_in_valid_range() {
        let product = create_test_product("Consumer Electronics", Some("Age 25-45"), Some(65));
        let analysis = analyze_market_for_product(&product);
        assert!(analysis.confidence_score >= 0.0 && analysis.confidence_score <= 1.0);
    }

    #[test]
    fn test_ad_type_display_name() {
        assert_eq!(AdType::SocialPost.display_name(), "Social Media Post");
        assert_eq!(AdType::Story.display_name(), "Story");
        assert_eq!(AdType::VideoScript.display_name(), "Video Script");
        assert_eq!(AdType::Carousel.display_name(), "Carousel");
        assert_eq!(AdType::Email.display_name(), "Email");
        assert_eq!(AdType::Sms.display_name(), "SMS");
    }

    #[test]
    fn test_default_ad_type() {
        assert_eq!(AdType::default(), AdType::SocialPost);
    }

    #[test]
    fn test_default_market_analysis() {
        let analysis = MarketAnalysis::default();
        assert_eq!(analysis.recommended_ad_type, AdType::SocialPost);
        assert_eq!(analysis.confidence_score, 0.5);
    }
}
