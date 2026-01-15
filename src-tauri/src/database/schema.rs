use rusqlite::{Connection, Result};

pub fn run_migrations(conn: &Connection) -> Result<()> {
    // Read and execute the initial schema migration
    let migration_sql = include_str!("../../../migrations/001_initial_schema.sql");

    conn.execute_batch(migration_sql)?;

    println!("Database migrations completed successfully");
    Ok(())
}
