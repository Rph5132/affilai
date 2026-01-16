-- Add Platform Support to Affiliate Links
-- Adds platform column to track which outlet/platform each link is for

-- Add platform column (default to amazon for backward compatibility)
ALTER TABLE affiliate_links ADD COLUMN platform TEXT DEFAULT 'amazon';

-- Create index on platform for filtering
CREATE INDEX IF NOT EXISTS idx_affiliate_links_platform ON affiliate_links(platform);

-- Update existing links to have platform set
UPDATE affiliate_links SET platform = 'amazon' WHERE platform IS NULL;
