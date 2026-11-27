//! Library IPC commands.
use crate::services::library_files::OpenedLibraryFiles;
use tauri::Manager;

#[tauri::command]
pub fn pending_library_files(state: tauri::State<'_, OpenedLibraryFiles>) -> Vec<String> {
    state.drain()
}

#[tauri::command]
pub async fn pick_library_files(
    app: tauri::AppHandle,
    kind: String,
) -> Result<Vec<String>, String> {
    let extension = match kind.as_str() {
        "books" => "epub",
        "comics" => "cbz",
        _ => return Err("Choose Books or Comics before importing.".into()),
    };
    let mut dialog = rfd::AsyncFileDialog::new()
        .set_title("Import into Papyrbound")
        .add_filter(
            if kind == "books" {
                "EPUB books"
            } else {
                "CBZ comics"
            },
            &[extension],
        );
    if let Some(window) = app.get_webview_window("main") {
        dialog = dialog.set_parent(&window);
    }
    let Some(files) = dialog.pick_files().await else {
        return Ok(Vec::new());
    };
    Ok(app
        .state::<OpenedLibraryFiles>()
        .authorize(files.into_iter().map(|file| file.path().to_path_buf())))
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
