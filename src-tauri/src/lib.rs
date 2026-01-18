// AffilAI - Affiliate Campaign Management Desktop App
mod commands;
mod database;
mod models;
mod services;

use commands::{ad_generation, affiliate_links, credentials, products};

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
            affiliate_links::get_all_affiliate_links,
            affiliate_links::get_links_by_product,
            affiliate_links::discover_affiliate_programs,
            affiliate_links::generate_affiliate_link,
            affiliate_links::generate_link_for_platform,
            affiliate_links::create_affiliate_link,
            affiliate_links::refresh_affiliate_link,
            affiliate_links::delete_affiliate_link,
            affiliate_links::generate_links_for_all_products,
            credentials::get_all_credentials,
            credentials::get_credential_by_platform,
            credentials::save_credential,
            credentials::delete_credential,
            ad_generation::generate_ad_for_product,
            ad_generation::get_ads_for_product,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
