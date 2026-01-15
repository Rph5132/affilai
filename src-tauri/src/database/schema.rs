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
