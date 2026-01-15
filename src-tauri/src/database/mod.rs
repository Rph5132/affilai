use rusqlite::{Connection, Result};
use std::path::PathBuf;
use tauri::AppHandle;

pub mod schema;

pub fn init_database(app_handle: &AppHandle) -> Result<Connection> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");

    // Create app directory if it doesn't exist
    std::fs::create_dir_all(&app_dir).expect("Failed to create app directory");

    let db_path = app_dir.join("affilai.db");
    let conn = Connection::open(&db_path)?;

    // Run migrations
    schema::run_migrations(&conn)?;

    Ok(conn)
}

pub fn get_connection(app_handle: &AppHandle) -> Result<Connection> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");

    let db_path = app_dir.join("affilai.db");
    Connection::open(&db_path)
}
