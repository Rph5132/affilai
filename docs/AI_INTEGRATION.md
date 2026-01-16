# AI Integration Guide for Affiliate Link Generation

## Overview

The AffilAI affiliate link system uses AI to intelligently discover and select the best affiliate programs for each product. This ensures high-quality links with competitive commission rates.

## AI Prompt Template

Location: [src-tauri/src/services/ai_affiliate.rs](../src-tauri/src/services/ai_affiliate.rs#L7)

### Prompt Structure

The AI prompt is designed to:

1. Analyze product details (name, category, description, price, audience)
2. Research official brand affiliate programs
3. Evaluate reputable affiliate networks
4. Validate program legitimacy
5. Prioritize based on quality metrics
6. Provide Amazon Associates as fallback

### Template Variables

- `{product_name}` - Product name
- `{category}` - Product category
- `{description}` - Product description
- `{price_range}` - Price range
- `{target_audience}` - Target demographic

### Expected AI Response Format

```json
[
  {
    "program_name": "Official Program Name",
    "commission_rate": 0.10,
    "cookie_duration": 30,
    "affiliate_url": "https://affiliate-signup-url.com",
    "is_official": true,
    "confidence_score": 0.95
  }
]
```

### Quality Criteria

The AI is instructed to prioritize programs with:

- Official brand partnerships (`is_official: true`)
- Higher commission rates (e.g., 10-20% vs 3-5%)
- Longer cookie durations (30-90 days preferred)
- Strong reputation and reliability
- Better conversion rates

### Fallback Strategy

Amazon Associates is used as fallback when:
- No official brand program exists
- Product is available on Amazon
- Commission rate is acceptable (typically 1-4%)

## Integrating Real AI Providers

### Current Implementation

The system uses a mock AI function for development:

```rust
pub fn mock_ai_discovery(product_name: &str, category: &str) -> Vec<AffiliateProgramDiscovery>
```

### Integration Steps

#### 1. OpenAI Integration

```rust
use reqwest::Client;

pub async fn call_openai_api(prompt: &str, api_key: &str) -> Result<String, String> {
    let client = Client::new();

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&serde_json::json!({
            "model": "gpt-4",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert affiliate marketing analyst."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.3
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
    let content = json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or("Invalid response format")?
        .to_string();

    Ok(content)
}
```

#### 2. Anthropic Claude Integration

```rust
pub async fn call_claude_api(prompt: &str, api_key: &str) -> Result<String, String> {
    let client = Client::new();

    let response = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .json(&serde_json::json!({
            "model": "claude-3-5-sonnet-20241022",
            "max_tokens": 2048,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
    let content = json["content"][0]["text"]
        .as_str()
        .ok_or("Invalid response format")?
        .to_string();

    Ok(content)
}
```

#### 3. Update discover_affiliate_programs Command

In [src-tauri/src/commands/affiliate_links.rs](../src-tauri/src/commands/affiliate_links.rs):

```rust
// Replace mock call with real AI
let prompt = build_discovery_prompt(&name, &category, &description, &price_range, &target_audience);

// Get API key from settings
let api_key = get_ai_api_key(&app_handle)?;

// Call AI provider
let ai_response = call_openai_api(&prompt, &api_key).await?;

// Parse response
let programs = parse_ai_response(&ai_response)?;
```

### API Key Management

Store API keys securely:

```rust
// Add to settings table
INSERT INTO settings (key, value) VALUES ('ai_api_key', 'encrypted_key_here');

// Retrieve in code
pub fn get_ai_api_key(app_handle: &AppHandle) -> Result<String, String> {
    let conn = get_connection(app_handle).map_err(|e| e.to_string())?;

    let key: String = conn
        .query_row(
            "SELECT value FROM settings WHERE key = 'ai_api_key'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| format!("API key not configured: {}", e))?;

    Ok(key)
}
```

## Quality Assurance

### Link Validation

The system avoids low-quality links through:

1. **AI Quality Scoring** - Each program gets a confidence score (0.0-1.0)
2. **Official Program Priority** - Brand programs ranked higher than networks
3. **Commission Rate Filtering** - Minimum thresholds prevent low-earning links
4. **Reputation Validation** - AI verifies program legitimacy
5. **Fallback Strategy** - Amazon Associates only when no better option exists

### Status Tracking

Each link has a status:

- `active` - Link is valid and functional
- `expired` - Cookie period has passed or program ended
- `invalid` - Link validation failed

### Refresh Mechanism

Links can be refreshed to:
- Update to better programs
- Fix expired links
- Improve commission rates
- Validate current status

## Performance Tracking Extension

### Future Schema Extension

```sql
-- Track link performance metrics
CREATE TABLE link_performance (
    id INTEGER PRIMARY KEY,
    link_id INTEGER NOT NULL,
    date DATE NOT NULL,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue REAL DEFAULT 0,
    commission_earned REAL DEFAULT 0,
    FOREIGN KEY (link_id) REFERENCES affiliate_links(id)
);
```

### Analytics Integration

The existing schema already supports:

- Click tracking (`click_events` table)
- Conversion tracking (`conversion_events` table)
- Performance aggregation (`performance_records` table)

To enable tracking:

1. Implement click tracking middleware
2. Connect to affiliate network APIs
3. Sync conversion data
4. Calculate ROI per link
5. Re-rank programs based on actual performance

### Link Optimization

Over time, the system can:

- Replace low-performing links automatically
- A/B test different affiliate networks
- Optimize for highest-earning programs
- Predict best programs for new products

## Configuration

### Environment Variables

```env
AI_PROVIDER=openai # or anthropic, local, etc.
AI_API_KEY=your_api_key_here
AI_MODEL=gpt-4 # or claude-3-5-sonnet-20241022
MIN_COMMISSION_RATE=0.05 # 5% minimum
PREFER_OFFICIAL_PROGRAMS=true
```

### Settings UI

Future UI can expose:

- AI provider selection
- API key configuration
- Quality thresholds
- Automatic refresh intervals
- Performance tracking toggles

## Error Handling

The system gracefully handles:

- AI API failures (falls back to mock)
- Invalid JSON responses (retries with clarification)
- Missing programs (uses Amazon fallback)
- Network timeouts (retries with exponential backoff)
- Rate limits (queues requests)

## Testing

### Mock Mode

Use `mock_ai_discovery()` for:
- Development without API costs
- Integration testing
- CI/CD pipelines
- Demo environments

### Test Cases

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mock_discovery() {
        let programs = mock_ai_discovery("Dyson V15", "Consumer Electronics");
        assert!(!programs.is_empty());
        assert!(programs[0].confidence_score > 0.8);
    }

    #[test]
    fn test_prompt_building() {
        let prompt = build_discovery_prompt(
            "Product Name",
            "Category",
            "Description",
            "$100-$200",
            "Adults 25-45"
        );
        assert!(prompt.contains("Product Name"));
        assert!(prompt.contains("Category"));
    }
}
```

## Best Practices

1. **Cache AI Responses** - Store discovered programs for 30 days
2. **Batch Processing** - Generate multiple links in parallel
3. **Rate Limiting** - Respect AI provider limits
4. **Error Logging** - Track failed discoveries for analysis
5. **Monitoring** - Alert on high failure rates
6. **Cost Control** - Set daily AI API spending limits
7. **Quality Metrics** - Track confidence scores over time

## Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com)
- [Affiliate Marketing Best Practices](https://www.affiliatemarketing.com)
- [Commission Rate Benchmarks](https://www.affstat.com)
