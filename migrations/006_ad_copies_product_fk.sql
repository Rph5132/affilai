-- Migration 006: Add AI ad generation support to ad_copies table
-- This migration enables generating ads directly for products without requiring a campaign
-- Note: ALTER TABLE ADD COLUMN statements are now handled in Rust code (schema.rs)
-- to gracefully handle cases where columns already exist

-- The following statements are handled in schema.rs:
-- ALTER TABLE ad_copies ADD COLUMN product_id INTEGER REFERENCES products(id) ON DELETE SET NULL;
-- ALTER TABLE ad_copies ADD COLUMN ad_type TEXT;
-- CREATE INDEX IF NOT EXISTS idx_ad_copies_product_id ON ad_copies(product_id);
-- CREATE INDEX IF NOT EXISTS idx_ad_copies_ad_type ON ad_copies(ad_type);

-- Note: SQLite does not support ALTER COLUMN to change NOT NULL constraint
-- The campaign_id column remains NOT NULL in the schema, but new inserts can work around this
-- by using a default/placeholder campaign or by recreating the table in a future migration
-- For now, application logic should handle nullable campaign_id semantically
