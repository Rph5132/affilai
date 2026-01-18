-- Add Platform Support to Affiliate Links
-- Adds platform column to track which outlet/platform each link is for
-- Note: ALTER TABLE ADD COLUMN is now handled in Rust code (schema.rs)
-- to gracefully handle cases where columns already exist

-- The following statements are handled in schema.rs:
-- ALTER TABLE affiliate_links ADD COLUMN platform TEXT DEFAULT 'amazon';
-- CREATE INDEX IF NOT EXISTS idx_affiliate_links_platform ON affiliate_links(platform);
-- UPDATE affiliate_links SET platform = 'amazon' WHERE platform IS NULL;
