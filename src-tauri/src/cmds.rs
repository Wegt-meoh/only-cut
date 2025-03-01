use std::path::Path;

use crate::errs;
use tauri::Manager;
use tokio::io::AsyncReadExt;

#[tauri::command]
pub async fn load_image(
    handler: tauri::AppHandle,
    reader: tauri::ipc::Channel<&[u8]>,
) -> Result<(), errs::Error> {
    // for simplicity this example does not include error handling
    let resource_path = handler
        .path()
        .resolve("resources/foo.txt", tauri::path::BaseDirectory::Resource)?;
    let mut file = tokio::fs::File::open(resource_path).await?;
    let mut chunk = vec![0; 4096];

    loop {
        let len = file.read(&mut chunk).await.unwrap();
        if len == 0 {
            // Length of zero means end of file.
            break;
        }
        reader.send(&chunk[0..len])?;
    }

    reader.send(&[])?;
    Ok(())
}

#[tauri::command]
pub async fn ffprobe(app: tauri::AppHandle, file_path: String) -> Result<(), errs::Error> {
    use tauri_plugin_shell::process::CommandEvent;
    use tauri_plugin_shell::ShellExt;

    let mp4_path = app
        .app_handle()
        .path()
        .resolve(file_path, tauri::path::BaseDirectory::Resource)?;

    let sidecar_command = app
        .shell()
        .sidecar("ffprobe")
        .unwrap()
        .args(["-hide_banner", mp4_path.to_str().unwrap()]);

    let (mut rx, mut _child) = sidecar_command.spawn().expect("Failed to spawn sidecar");

    tauri::async_runtime::spawn(async move {
        // read events such as stdout
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line_bytes) => {
                    let line = String::from_utf8_lossy(&line_bytes);
                    println!("STDOUT: {}", line);
                }
                CommandEvent::Stderr(line_bytes) => {
                    let line = String::from_utf8_lossy(&line_bytes);
                    eprintln!("STDERR: {}", line);
                }
                CommandEvent::Error(error) => {
                    eprintln!("Error: {:?}", error);
                }
                CommandEvent::Terminated(payload) => {
                    println!("Process terminated: {:?}", payload);
                    break;
                }
                _ => {
                    println!("unknown event type");
                }
            }
        }
    });

    Ok(())
}

#[tauri::command]
pub fn move_to_trash(path: String) -> Result<(), String> {
    let path = Path::new(&path);
    if !path.exists() {
        return Err("Path does not exist".to_string());
    }

    match trash::delete(path) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to move to trash: {}", e)),
    }
}
