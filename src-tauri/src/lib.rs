// AffilAI - Affiliate Campaign Management Desktop App
mod commands;
mod database;
mod models;

use commands::products;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Initialize database
            let app_handle = app.handle().clone();
            match database::init_database(&app_handle) {
                Ok(_) => println!("Database initialized successfully"),
                Err(e) => eprintln!("Failed to initialize database: {}", e),
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            products::get_all_products,
            products::get_product_by_id,
            products::create_product,
            products::update_product,
            products::delete_product,
            products::search_products,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
