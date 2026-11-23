//! Library IPC commands.
use crate::services::library_files::OpenedLibraryFiles;
use tauri::Manager;

#[tauri::command]
pub fn pending_library_files(state: tauri::State<'_, OpenedLibraryFiles>) -> Vec<String> {
    state.drain()
}

#[tauri::command]
pub async fn read_library_file(
    app: tauri::AppHandle,
    path: String,
) -> Result<tauri::ipc::Response, String> {
    tauri::async_runtime::spawn_blocking(move || {
        app.state::<OpenedLibraryFiles>()
            .read(std::path::Path::new(&path))
    })
    .await
    .map_err(|_| "File reading was interrupted.".to_string())?
    .map(tauri::ipc::Response::new)
}
