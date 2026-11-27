//! Dictionary IPC keeps parsing off the UI thread.
#[tauri::command]
pub async fn lookup_dictionary(candidates: Vec<String>) -> Result<serde_json::Value, String> {
    tauri::async_runtime::spawn_blocking(move || crate::services::dictionary::lookup(&candidates))
        .await
        .map_err(|_| "Dictionary lookup was interrupted.".to_string())?
}
