-- AffilAI Database Schema
-- Version: 1.0
-- Description: Initial schema for affiliate campaign management

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    price_range TEXT,
    target_audience TEXT,
    trending_score INTEGER DEFAULT 0,
    notes TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate Programs table
CREATE TABLE IF NOT EXISTS affiliate_programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    base_url TEXT,
    default_commission_rate REAL,
    cookie_duration INTEGER,
    api_key_encrypted TEXT,
    api_secret_encrypted TEXT,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Product-Program associations
CREATE TABLE IF NOT EXISTS product_programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    program_id INTEGER NOT NULL,
    commission_rate REAL,
    product_url TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES affiliate_programs(id) ON DELETE CASCADE,
    UNIQUE(product_id, program_id)
);

-- Affiliate Links table
CREATE TABLE IF NOT EXISTS affiliate_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    program_id INTEGER NOT NULL,
    short_name TEXT NOT NULL,
    full_url TEXT NOT NULL,
    shortened_url TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES affiliate_programs(id) ON DELETE CASCADE
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    platform TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    budget REAL,
    start_date DATE,
    end_date DATE,
    target_audience TEXT,
    targeting_details TEXT,
    objective TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Ad Copy table
CREATE TABLE IF NOT EXISTS ad_copies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    variation_name TEXT,
    headline TEXT NOT NULL,
    body_text TEXT,
    cta TEXT,
    ad_format TEXT,
    platform_specific_data TEXT,
    performance_score REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Creative Assets table
CREATE TABLE IF NOT EXISTS creative_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER,
    ad_copy_id INTEGER,
    asset_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    thumbnail_path TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (ad_copy_id) REFERENCES ad_copies(id) ON DELETE SET NULL
);

-- Campaign Links (many-to-many)
CREATE TABLE IF NOT EXISTS campaign_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    link_id INTEGER NOT NULL,
    is_primary BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (link_id) REFERENCES affiliate_links(id) ON DELETE CASCADE,
    UNIQUE(campaign_id, link_id)
);

-- Performance Tracking table
CREATE TABLE IF NOT EXISTS performance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id INTEGER,
    campaign_id INTEGER,
    date DATE NOT NULL,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue REAL DEFAULT 0,
    cost REAL DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    source TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (link_id) REFERENCES affiliate_links(id) ON DELETE SET NULL,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
);

-- Click Events table (detailed tracking)
CREATE TABLE IF NOT EXISTS click_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id INTEGER NOT NULL,
    campaign_id INTEGER,
    clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT,
    user_agent TEXT,
    referrer TEXT,
    FOREIGN KEY (link_id) REFERENCES affiliate_links(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
);

-- Conversion Events table
CREATE TABLE IF NOT EXISTS conversion_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id INTEGER NOT NULL,
    campaign_id INTEGER,
    converted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    order_value REAL,
    commission REAL,
    status TEXT DEFAULT 'pending',
    order_id TEXT,
    notes TEXT,
    FOREIGN KEY (link_id) REFERENCES affiliate_links(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
);

-- Settings table (app configuration)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_product ON campaigns(product_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform ON campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_performance_date ON performance_records(date);
CREATE INDEX IF NOT EXISTS idx_performance_link ON performance_records(link_id);
CREATE INDEX IF NOT EXISTS idx_performance_campaign ON performance_records(campaign_id);
CREATE INDEX IF NOT EXISTS idx_clicks_link ON click_events(link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_date ON click_events(clicked_at);
CREATE INDEX IF NOT EXISTS idx_conversions_link ON conversion_events(link_id);
CREATE INDEX IF NOT EXISTS idx_conversions_date ON conversion_events(converted_at);
