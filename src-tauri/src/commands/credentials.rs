use tauri::AppHandle;
use crate::database::get_connection;
use crate::models::affiliate_credentials::*;
use rusqlite::params;

#[tauri::command]
pub async fn get_all_credentials(
    app_handle: AppHandle,
) -> Result<Vec<AffiliateCredential>, String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, platform, affiliate_id, shop_id, account_name,
                  api_key, api_secret, active, verified, notes, created_at, updated_at
                  FROM affiliate_credentials ORDER BY platform")
        .map_err(|e| e.to_string())?;

    let credentials = stmt
        .query_map([], |row| {
            Ok(AffiliateCredential {
                id: row.get(0)?,
                platform: row.get(1)?,
                affiliate_id: row.get(2)?,
                shop_id: row.get(3)?,
                account_name: row.get(4)?,
                api_key: row.get(5)?,
                api_secret: row.get(6)?,
                active: row.get(7)?,
                verified: row.get(8)?,
                notes: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(credentials)
}

#[tauri::command]
pub async fn get_credential_by_platform(
    app_handle: AppHandle,
    platform: String,
) -> Result<Option<AffiliateCredential>, String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    let result = conn.query_row(
        "SELECT id, platform, affiliate_id, shop_id, account_name,
         api_key, api_secret, active, verified, notes, created_at, updated_at
         FROM affiliate_credentials WHERE platform = ?1",
        params![platform],
        |row| {
            Ok(AffiliateCredential {
                id: row.get(0)?,
                platform: row.get(1)?,
                affiliate_id: row.get(2)?,
                shop_id: row.get(3)?,
                account_name: row.get(4)?,
                api_key: row.get(5)?,
                api_secret: row.get(6)?,
                active: row.get(7)?,
                verified: row.get(8)?,
                notes: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        },
    );

    match result {
        Ok(cred) => Ok(Some(cred)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn save_credential(
    app_handle: AppHandle,
    input: SaveCredentialInput,
) -> Result<AffiliateCredential, String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO affiliate_credentials
         (platform, affiliate_id, shop_id, account_name, api_key, api_secret, notes, active)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 1)
         ON CONFLICT(platform) DO UPDATE SET
         affiliate_id = excluded.affiliate_id,
         shop_id = excluded.shop_id,
         account_name = excluded.account_name,
         api_key = excluded.api_key,
         api_secret = excluded.api_secret,
         notes = excluded.notes,
         updated_at = CURRENT_TIMESTAMP",
        params![
            input.platform,
            input.affiliate_id,
            input.shop_id,
            input.account_name,
            input.api_key,
            input.api_secret,
            input.notes,
        ],
    )
    .map_err(|e| e.to_string())?;

    get_credential_by_platform(app_handle, input.platform).await?
        .ok_or_else(|| "Failed to retrieve saved credential".to_string())
}

#[tauri::command]
pub async fn delete_credential(
    app_handle: AppHandle,
    platform: String,
) -> Result<(), String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    conn.execute(
        "DELETE FROM affiliate_credentials WHERE platform = ?1",
        params![platform],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
