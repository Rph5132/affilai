use crate::database::get_connection;
use crate::models::affiliate_link::{
    AffiliateLink, AffiliateProgramDiscovery, CreateAffiliateLinkInput, GenerateLinkRequest,
    GenerateLinkForPlatformRequest,
};
use crate::services::ai_affiliate::{generate_tracking_url, mock_ai_discovery_with_platforms};
use rusqlite::params;
use tauri::AppHandle;

#[tauri::command]
pub async fn get_all_affiliate_links(app_handle: AppHandle) -> Result<Vec<AffiliateLink>, String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, product_id, product_name, platform, program_name, commission_rate,
             cookie_duration, tracking_url, destination_url, status, created_at, updated_at
             FROM affiliate_links ORDER BY created_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let links = stmt
        .query_map([], |row| {
            Ok(AffiliateLink {
                id: Some(row.get(0)?),
                product_id: row.get(1)?,
                product_name: row.get(2)?,
                platform: row.get(3)?,
                program_name: row.get(4)?,
                commission_rate: row.get(5)?,
                cookie_duration: row.get(6)?,
                tracking_url: row.get(7)?,
                destination_url: row.get(8)?,
                status: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(links)
}

#[tauri::command]
pub async fn get_links_by_product(
    app_handle: AppHandle,
    product_id: i64,
) -> Result<Vec<AffiliateLink>, String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, product_id, product_name, platform, program_name, commission_rate,
             cookie_duration, tracking_url, destination_url, status, created_at, updated_at
             FROM affiliate_links WHERE product_id = ?1 ORDER BY created_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let links = stmt
        .query_map(params![product_id], |row| {
            Ok(AffiliateLink {
                id: Some(row.get(0)?),
                product_id: row.get(1)?,
                product_name: row.get(2)?,
                platform: row.get(3)?,
                program_name: row.get(4)?,
                commission_rate: row.get(5)?,
                cookie_duration: row.get(6)?,
                tracking_url: row.get(7)?,
                destination_url: row.get(8)?,
                status: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(links)
}

#[tauri::command]
pub async fn discover_affiliate_programs(
    app_handle: AppHandle,
    product_id: i64,
) -> Result<Vec<AffiliateProgramDiscovery>, String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    // Fetch ALL product metrics
    let product = conn
        .query_row(
            "SELECT name, category, description, price_range, target_audience, trending_score
             FROM products WHERE id = ?1",
            params![product_id],
            |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, Option<String>>(2)?.unwrap_or_default(),
                    row.get::<_, Option<String>>(3)?.unwrap_or_default(),
                    row.get::<_, Option<String>>(4)?.unwrap_or_default(),
                    row.get::<_, Option<i32>>(5)?.unwrap_or(50),
                ))
            },
        )
        .map_err(|e| format!("Product not found: {}", e))?;

    let (name, category, _description, price_range, target_audience, trending_score) = product;

    // Call platform-aware discovery with all metrics
    let programs = mock_ai_discovery_with_platforms(
        &name,
        &category,
        trending_score,
        &target_audience,
        &price_range,
    );

    Ok(programs)
}

#[tauri::command]
pub async fn generate_affiliate_link(
    app_handle: AppHandle,
    request: GenerateLinkRequest,
) -> Result<AffiliateLink, String> {
    // Discover programs
    let programs = discover_affiliate_programs(app_handle.clone(), request.product_id).await?;

    if programs.is_empty() {
        return Err("No affiliate programs found for this product".to_string());
    }

    // Select best program (highest audience_match_score)
    let best_program = programs
        .into_iter()
        .max_by(|a, b| {
            a.audience_match_score
                .partial_cmp(&b.audience_match_score)
                .unwrap_or(std::cmp::Ordering::Equal)
        })
        .ok_or("Failed to select best program")?;

    // Fetch product details
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;
    let product_name: String = conn
        .query_row(
            "SELECT name FROM products WHERE id = ?1",
            params![request.product_id],
            |row| row.get(0),
        )
        .map_err(|e| format!("Product not found: {}", e))?;

    // Generate tracking URL with platform
    let platform_str = best_program.platform.to_string();
    let tracking_url = generate_tracking_url(
        &platform_str,
        &best_program.program_name,
        &product_name,
        &best_program.affiliate_url,
    );

    let input = CreateAffiliateLinkInput {
        product_id: request.product_id,
        product_name: product_name.clone(),
        platform: platform_str,
        program_name: best_program.program_name,
        commission_rate: Some(best_program.commission_rate),
        cookie_duration: Some(best_program.cookie_duration),
        tracking_url: tracking_url.clone(),
        destination_url: best_program.affiliate_url,
    };

    create_affiliate_link(app_handle, input).await
}

#[tauri::command]
pub async fn generate_link_for_platform(
    app_handle: AppHandle,
    request: GenerateLinkForPlatformRequest,
) -> Result<AffiliateLink, String> {
    // Discover all platform options
    let programs = discover_affiliate_programs(app_handle.clone(), request.product_id).await?;

    // Find the specific platform requested
    let selected_program = programs
        .into_iter()
        .find(|p| p.platform.to_string() == request.platform.to_lowercase())
        .ok_or_else(|| format!("Platform {} not available for this product", request.platform))?;

    // Fetch product details
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;
    let product_name: String = conn
        .query_row(
            "SELECT name FROM products WHERE id = ?1",
            params![request.product_id],
            |row| row.get(0),
        )
        .map_err(|e| format!("Product not found: {}", e))?;

    // Generate tracking URL
    let platform_str = selected_program.platform.to_string();
    let tracking_url = generate_tracking_url(
        &platform_str,
        &selected_program.program_name,
        &product_name,
        &selected_program.affiliate_url,
    );

    let input = CreateAffiliateLinkInput {
        product_id: request.product_id,
        product_name: product_name.clone(),
        platform: platform_str,
        program_name: selected_program.program_name,
        commission_rate: Some(selected_program.commission_rate),
        cookie_duration: Some(selected_program.cookie_duration),
        tracking_url: tracking_url.clone(),
        destination_url: selected_program.affiliate_url,
    };

    create_affiliate_link(app_handle, input).await
}

#[tauri::command]
pub async fn create_affiliate_link(
    app_handle: AppHandle,
    input: CreateAffiliateLinkInput,
) -> Result<AffiliateLink, String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO affiliate_links (product_id, product_name, platform, program_name,
         commission_rate, cookie_duration, tracking_url, destination_url, status)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 'active')",
        params![
            input.product_id,
            input.product_name,
            input.platform,
            input.program_name,
            input.commission_rate,
            input.cookie_duration,
            input.tracking_url,
            input.destination_url,
        ],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();

    // Fetch the created link
    let link = conn
        .query_row(
            "SELECT id, product_id, product_name, platform, program_name, commission_rate,
             cookie_duration, tracking_url, destination_url, status, created_at, updated_at
             FROM affiliate_links WHERE id = ?1",
            params![id],
            |row| {
                Ok(AffiliateLink {
                    id: Some(row.get(0)?),
                    product_id: row.get(1)?,
                    product_name: row.get(2)?,
                    platform: row.get(3)?,
                    program_name: row.get(4)?,
                    commission_rate: row.get(5)?,
                    cookie_duration: row.get(6)?,
                    tracking_url: row.get(7)?,
                    destination_url: row.get(8)?,
                    status: row.get(9)?,
                    created_at: row.get(10)?,
                    updated_at: row.get(11)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(link)
}

#[tauri::command]
pub async fn refresh_affiliate_link(
    app_handle: AppHandle,
    link_id: i64,
) -> Result<AffiliateLink, String> {
    // Get existing link
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    let (product_id, product_name): (i64, String) = conn
        .query_row(
            "SELECT product_id, product_name FROM affiliate_links WHERE id = ?1",
            params![link_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .map_err(|e| format!("Link not found: {}", e))?;

    // Regenerate link - use best platform
    let programs = discover_affiliate_programs(app_handle.clone(), product_id).await?;

    if programs.is_empty() {
        return Err("No affiliate programs found".to_string());
    }

    let best_program = programs
        .into_iter()
        .max_by(|a, b| {
            a.audience_match_score
                .partial_cmp(&b.audience_match_score)
                .unwrap_or(std::cmp::Ordering::Equal)
        })
        .ok_or("Failed to select best program")?;

    let platform_str = best_program.platform.to_string();
    let tracking_url = generate_tracking_url(
        &platform_str,
        &best_program.program_name,
        &product_name,
        &best_program.affiliate_url,
    );

    // Update existing link
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE affiliate_links SET platform = ?1, program_name = ?2, commission_rate = ?3,
         cookie_duration = ?4, tracking_url = ?5, destination_url = ?6,
         status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?7",
        params![
            platform_str,
            best_program.program_name,
            best_program.commission_rate,
            best_program.cookie_duration,
            tracking_url,
            best_program.affiliate_url,
            link_id,
        ],
    )
    .map_err(|e| e.to_string())?;

    // Fetch updated link
    let link = conn
        .query_row(
            "SELECT id, product_id, product_name, platform, program_name, commission_rate,
             cookie_duration, tracking_url, destination_url, status, created_at, updated_at
             FROM affiliate_links WHERE id = ?1",
            params![link_id],
            |row| {
                Ok(AffiliateLink {
                    id: Some(row.get(0)?),
                    product_id: row.get(1)?,
                    product_name: row.get(2)?,
                    platform: row.get(3)?,
                    program_name: row.get(4)?,
                    commission_rate: row.get(5)?,
                    cookie_duration: row.get(6)?,
                    tracking_url: row.get(7)?,
                    destination_url: row.get(8)?,
                    status: row.get(9)?,
                    created_at: row.get(10)?,
                    updated_at: row.get(11)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(link)
}

#[tauri::command]
pub async fn delete_affiliate_link(app_handle: AppHandle, id: i64) -> Result<(), String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM affiliate_links WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn generate_links_for_all_products(
    app_handle: AppHandle,
) -> Result<Vec<AffiliateLink>, String> {
    // Get all products - collect IDs and drop connection before awaiting
    let product_ids: Vec<i64> = {
        let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare("SELECT id FROM products")
            .map_err(|e| e.to_string())?;

        let ids = stmt
            .query_map([], |row| row.get(0))
            .map_err(|e| e.to_string())?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?;

        ids
    }; // Connection dropped here

    // Generate links for each product
    let mut generated_links = Vec::new();

    for product_id in product_ids {
        // Check if link already exists - use scoped connection
        let exists: bool = {
            let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;
            conn.query_row(
                "SELECT COUNT(*) FROM affiliate_links WHERE product_id = ?1",
                params![product_id],
                |row| {
                    let count: i64 = row.get(0)?;
                    Ok(count > 0)
                },
            )
            .unwrap_or(false)
        }; // Connection dropped here

        if !exists {
            match generate_affiliate_link(
                app_handle.clone(),
                GenerateLinkRequest { product_id },
            )
            .await
            {
                Ok(link) => generated_links.push(link),
                Err(e) => eprintln!("Failed to generate link for product {}: {}", product_id, e),
            }
        }
    }

    Ok(generated_links)
}
