use rusqlite::{Connection, Result};

/// Helper function to add a column if it doesn't already exist
/// SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS, so we check first
fn add_column_if_not_exists(
    conn: &Connection,
    table: &str,
    column: &str,
    column_def: &str,
) -> Result<()> {
    // Check if column exists using pragma_table_info
    let column_exists: bool = conn
        .query_row(
            &format!(
                "SELECT COUNT(*) > 0 FROM pragma_table_info('{}') WHERE name = ?",
                table
            ),
            [column],
            |row| row.get(0),
        )
        .unwrap_or(false);

    if !column_exists {
        conn.execute(
            &format!("ALTER TABLE {} ADD COLUMN {} {}", table, column, column_def),
            [],
        )?;
        println!("  Added column {}.{}", table, column);
    }
    Ok(())
}

pub fn run_migrations(conn: &Connection) -> Result<()> {
    // Check if migrations have been run before
    let migrations_table_exists: bool = conn
        .query_row(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='settings'",
            [],
            |_| Ok(true),
        )
        .unwrap_or(false);

    // Run initial schema migration
    let schema_sql = include_str!("../../../migrations/001_initial_schema.sql");
    conn.execute_batch(schema_sql)?;
    println!("✓ Schema migration completed");

    // Run affiliate links extension migration
    let affiliate_links_sql = include_str!("../../../migrations/003_affiliate_links_extension.sql");
    conn.execute_batch(affiliate_links_sql)?;
    println!("✓ Affiliate links extension migration completed");

    // Run platform support migration (004) - add column with existence check
    add_column_if_not_exists(conn, "affiliate_links", "platform", "TEXT DEFAULT 'amazon'")?;
    conn.execute_batch("CREATE INDEX IF NOT EXISTS idx_affiliate_links_platform ON affiliate_links(platform);")?;
    conn.execute_batch("UPDATE affiliate_links SET platform = 'amazon' WHERE platform IS NULL;")?;
    println!("✓ Platform support migration completed");

    // Run affiliate credentials migration (005)
    let credentials_sql = include_str!("../../../migrations/005_affiliate_credentials.sql");
    conn.execute_batch(credentials_sql)?;
    // Add product platform columns with existence checks
    add_column_if_not_exists(conn, "products", "amazon_asin", "TEXT")?;
    add_column_if_not_exists(conn, "products", "tiktok_product_id", "TEXT")?;
    add_column_if_not_exists(conn, "products", "instagram_product_id", "TEXT")?;
    add_column_if_not_exists(conn, "products", "youtube_video_id", "TEXT")?;
    add_column_if_not_exists(conn, "products", "pinterest_pin_id", "TEXT")?;
    add_column_if_not_exists(conn, "products", "product_url", "TEXT")?;
    println!("✓ Affiliate credentials migration completed");

    // Run ad copies product FK migration (006) - add columns with existence checks
    add_column_if_not_exists(conn, "ad_copies", "product_id", "INTEGER REFERENCES products(id) ON DELETE SET NULL")?;
    add_column_if_not_exists(conn, "ad_copies", "ad_type", "TEXT")?;
    conn.execute_batch("CREATE INDEX IF NOT EXISTS idx_ad_copies_product_id ON ad_copies(product_id);")?;
    conn.execute_batch("CREATE INDEX IF NOT EXISTS idx_ad_copies_ad_type ON ad_copies(ad_type);")?;
    println!("✓ Ad copies product FK migration completed");

    // Check if seed data has been run
    if migrations_table_exists {
        let seed_run: bool = conn
            .query_row(
                "SELECT value FROM settings WHERE key = 'seed_data_run'",
                [],
                |row| row.get(0),
            )
            .unwrap_or(String::from("false")) == "true";

        if seed_run {
            println!("✓ Seed data already populated");
            // Still need to ensure default campaign exists
            ensure_default_campaign(conn)?;
            return Ok(());
        }
    }

    // Run seed data migration
    let seed_sql = include_str!("../../../migrations/002_seed_products.sql");
    conn.execute_batch(seed_sql)?;

    // Mark seed data as run
    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('seed_data_run', 'true')",
        [],
    )?;

    println!("✓ Seed data migration completed");
    println!("✓ Database initialized with 10 trending products");

    // Create default campaign for direct product ads (007)
    ensure_default_campaign(conn)?;

    Ok(())
}

/// Creates a default campaign for direct product ads if it doesn't exist
fn ensure_default_campaign(conn: &Connection) -> Result<()> {
    // Check if default campaign already exists
    let exists: bool = conn
        .query_row(
            "SELECT COUNT(*) > 0 FROM campaigns WHERE id = 1",
            [],
            |row| row.get(0),
        )
        .unwrap_or(false);

    if exists {
        return Ok(());
    }

    // Use the first available product_id since campaigns.product_id is NOT NULL
    let first_product_id: Option<i64> = conn
        .query_row("SELECT id FROM products LIMIT 1", [], |row| row.get(0))
        .ok();

    if let Some(product_id) = first_product_id {
        conn.execute(
            "INSERT OR IGNORE INTO campaigns (id, name, product_id, platform, status, objective, notes)
             VALUES (1, 'Direct Product Ads', ?1, 'multi', 'active', 'product_awareness', 'System campaign for ads generated directly from products')",
            [product_id],
        )?;
        println!("✓ Default product ads campaign created");
    }

    Ok(())
}
