use rusqlite::{Connection, Result};

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

    // Run platform support migration
    let platform_sql = include_str!("../../../migrations/004_add_platform_to_links.sql");
    conn.execute_batch(platform_sql)?;
    println!("✓ Platform support migration completed");

    // Run affiliate credentials migration
    let credentials_sql = include_str!("../../../migrations/005_affiliate_credentials.sql");
    conn.execute_batch(credentials_sql)?;
    println!("✓ Affiliate credentials migration completed");

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

    Ok(())
}
