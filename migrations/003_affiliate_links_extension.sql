-- Affiliate Links Extension Migration
-- Extends the affiliate_links table to support AI-generated tracking links

-- Drop and recreate affiliate_links table with enhanced schema
DROP TABLE IF EXISTS affiliate_links;

CREATE TABLE affiliate_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    program_name TEXT NOT NULL,
    commission_rate REAL,
    cookie_duration INTEGER,
    tracking_url TEXT NOT NULL,
    destination_url TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'invalid')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_affiliate_links_product ON affiliate_links(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_status ON affiliate_links(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_program ON affiliate_links(program_name);
