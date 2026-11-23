mod commands;
mod services;
mod types;
use services::library_files::OpenedLibraryFiles;
use tauri::{Emitter, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(OpenedLibraryFiles::default())
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
            app.state::<OpenedLibraryFiles>().enqueue(
                args.into_iter()
                    .skip(1)
                    .map(|path| std::path::Path::new(&cwd).join(path)),
            );
            let _ = app.emit("library-files-available", ());
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .invoke_handler(tauri::generate_handler![
            commands::library::pending_library_files,
            commands::library::read_library_file
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::DragDrop(tauri::DragDropEvent::Drop { paths, .. }) = event {
                window.state::<OpenedLibraryFiles>().enqueue(paths.clone());
                let _ = window.emit("library-files-available", ());
            }
        })
        .setup(|app| {
            let config = app.config().app.windows[0].clone();
            let builder = tauri::WebviewWindowBuilder::from_config(app, &config)?;
            // Retain the legacy WebView profile so existing local libraries survive branding changes.
            #[cfg(windows)]
            let builder = {
                let legacy = app
                    .path()
                    .app_local_data_dir()?
                    .parent()
                    .unwrap()
                    .join("com.tauri.dev");
                if legacy.is_dir() {
                    builder.data_directory(legacy)
                } else {
                    builder
                }
            };
            builder.build()?;
            app.state::<OpenedLibraryFiles>()
                .enqueue(std::env::args_os().skip(1).map(std::path::PathBuf::from));
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
