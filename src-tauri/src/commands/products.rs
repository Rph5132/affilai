use crate::database::get_connection;
use crate::models::product::{CreateProductInput, Product, UpdateProductInput};
use rusqlite::params;
use tauri::{AppHandle, State};

#[tauri::command]
pub async fn get_all_products(app_handle: AppHandle) -> Result<Vec<Product>, String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, name, category, description, price_range, target_audience,
             trending_score, notes, image_url, created_at, updated_at
             FROM products ORDER BY trending_score DESC, name ASC",
        )
        .map_err(|e| e.to_string())?;

    let products = stmt
        .query_map([], |row| {
            Ok(Product {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                category: row.get(2)?,
                description: row.get(3)?,
                price_range: row.get(4)?,
                target_audience: row.get(5)?,
                trending_score: row.get(6)?,
                notes: row.get(7)?,
                image_url: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(products)
}

#[tauri::command]
pub async fn get_product_by_id(app_handle: AppHandle, id: i64) -> Result<Product, String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    let product = conn
        .query_row(
            "SELECT id, name, category, description, price_range, target_audience,
             trending_score, notes, image_url, created_at, updated_at
             FROM products WHERE id = ?1",
            params![id],
            |row| {
                Ok(Product {
                    id: Some(row.get(0)?),
                    name: row.get(1)?,
                    category: row.get(2)?,
                    description: row.get(3)?,
                    price_range: row.get(4)?,
                    target_audience: row.get(5)?,
                    trending_score: row.get(6)?,
                    notes: row.get(7)?,
                    image_url: row.get(8)?,
                    created_at: row.get(9)?,
                    updated_at: row.get(10)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(product)
}

#[tauri::command]
pub async fn create_product(
    app_handle: AppHandle,
    input: CreateProductInput,
) -> Result<Product, String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO products (name, category, description, price_range, target_audience,
         trending_score, notes, image_url)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            input.name,
            input.category,
            input.description,
            input.price_range,
            input.target_audience,
            input.trending_score.unwrap_or(0),
            input.notes,
            input.image_url,
        ],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    get_product_by_id(app_handle, id).await
}

#[tauri::command]
pub async fn update_product(
    app_handle: AppHandle,
    input: UpdateProductInput,
) -> Result<Product, String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    // Build dynamic UPDATE query based on provided fields
    let mut updates = Vec::new();
    let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(name) = input.name {
        updates.push("name = ?");
        params_vec.push(Box::new(name));
    }
    if let Some(category) = input.category {
        updates.push("category = ?");
        params_vec.push(Box::new(category));
    }
    if let Some(description) = input.description {
        updates.push("description = ?");
        params_vec.push(Box::new(description));
    }
    if let Some(price_range) = input.price_range {
        updates.push("price_range = ?");
        params_vec.push(Box::new(price_range));
    }
    if let Some(target_audience) = input.target_audience {
        updates.push("target_audience = ?");
        params_vec.push(Box::new(target_audience));
    }
    if let Some(trending_score) = input.trending_score {
        updates.push("trending_score = ?");
        params_vec.push(Box::new(trending_score));
    }
    if let Some(notes) = input.notes {
        updates.push("notes = ?");
        params_vec.push(Box::new(notes));
    }
    if let Some(image_url) = input.image_url {
        updates.push("image_url = ?");
        params_vec.push(Box::new(image_url));
    }

    if updates.is_empty() {
        return Err("No fields to update".to_string());
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    params_vec.push(Box::new(input.id));

    let query = format!(
        "UPDATE products SET {} WHERE id = ?",
        updates.join(", ")
    );

    let params_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|b| &**b as &dyn rusqlite::ToSql).collect();

    conn.execute(&query, params_refs.as_slice())
        .map_err(|e| e.to_string())?;

    get_product_by_id(app_handle, input.id).await
}

#[tauri::command]
pub async fn delete_product(app_handle: AppHandle, id: i64) -> Result<(), String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM products WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn search_products(
    app_handle: AppHandle,
    query: String,
) -> Result<Vec<Product>, String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;

    let search_pattern = format!("%{}%", query);
    let mut stmt = conn
        .prepare(
            "SELECT id, name, category, description, price_range, target_audience,
             trending_score, notes, image_url, created_at, updated_at
             FROM products
             WHERE name LIKE ?1 OR category LIKE ?1 OR description LIKE ?1
             ORDER BY trending_score DESC, name ASC",
        )
        .map_err(|e| e.to_string())?;

    let products = stmt
        .query_map(params![search_pattern], |row| {
            Ok(Product {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                category: row.get(2)?,
                description: row.get(3)?,
                price_range: row.get(4)?,
                target_audience: row.get(5)?,
                trending_score: row.get(6)?,
                notes: row.get(7)?,
                image_url: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(products)
}
