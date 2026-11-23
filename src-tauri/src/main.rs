use std::process::Stdio;
use tauri::{Builder, Manager, Runtime, WindowEvent};
use tauri::api::process::{Command, CommandEvent};
use std::sync::Arc;
use std::sync::Mutex;

#[tauri::command]
fn get_backend_port() -> u16 {
    // For now we use a fixed port; can be made dynamic later.
    5000
}

fn main() {
    // Build the Tauri app.
    Builder::default()
        .invoke_handler(tauri::generate_handler![get_backend_port])
        .setup(|app| {
            // Launch the Python backend as a sidecar.
            // The sidecar executable path is defined in tauri.conf.json under "path.sidecar".
            let sidecar_path = app.path_resolver().resolve_resource("../backend/dist/spotify_backend.exe")
                .expect("Failed to resolve sidecar path");

            // Set environment variable to allow port override (optional).
            let env = [ ("SPOTIFY_BACKEND_PORT", "5000") ];

            let (mut rx, _child) = Command::new_sidecar(&sidecar_path)
                .expect("Sidecar not found")
                .envs(env.iter().cloned())
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .spawn()
                .expect("Failed to spawn sidecar");

            // Optionally listen to sidecar output for debugging.
            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line) => println!("[backend stdout] {}", line),
                        CommandEvent::Stderr(line) => eprintln!("[backend stderr] {}", line),
                        CommandEvent::Terminated(exit) => {
                            println!("Backend process terminated with code: {:?}", exit.code);
                        }
                        _ => {}
                    }
                }
            });
            Ok(())
        })
        .on_window_event(|event| {
            // When the main window is closed, terminate the sidecar.
            if let WindowEvent::CloseRequested { api, .. } = event.event() {
                // Attempt graceful termination.
                let _ = event.window().app_handle().process_stdout(event.window().label().to_string());
                api.prevent_close(); // keep window open until sidecar stops.
                // In a real implementation we would signal the sidecar to shut down.
                // For now we just allow the window to close.
                event.window().close().unwrap();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
