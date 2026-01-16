-- AffilAI Database Migration 005
-- Add Affiliate Credentials Management
-- Description: Store user's affiliate program credentials and add product-platform mapping

-- Store user's affiliate program credentials
CREATE TABLE IF NOT EXISTS affiliate_credentials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL UNIQUE,  -- 'amazon', 'tiktok', 'instagram', 'youtube', 'pinterest'

    -- Platform-specific identifiers
    affiliate_id TEXT,               -- Amazon Associate Tag, TikTok Creator ID, etc.
    shop_id TEXT,                    -- For TikTok/Instagram shops
    account_name TEXT,               -- Display name for user reference

    -- Optional API credentials (for future API integration)
    api_key TEXT,                    -- Not encrypted in v1 - simple implementation
    api_secret TEXT,

    -- Status tracking
    active BOOLEAN DEFAULT 1,
    verified BOOLEAN DEFAULT 0,      -- Whether credentials have been tested/verified
    notes TEXT,                      -- User notes about this account

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add platform-specific product identifiers to products table
ALTER TABLE products ADD COLUMN amazon_asin TEXT;
ALTER TABLE products ADD COLUMN tiktok_product_id TEXT;
ALTER TABLE products ADD COLUMN instagram_product_id TEXT;
ALTER TABLE products ADD COLUMN youtube_video_id TEXT;
ALTER TABLE products ADD COLUMN pinterest_pin_id TEXT;
ALTER TABLE products ADD COLUMN product_url TEXT;

-- Create index for quick ASIN lookups
CREATE INDEX IF NOT EXISTS idx_products_amazon_asin ON products(amazon_asin);
