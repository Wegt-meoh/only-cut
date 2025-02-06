#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub fn login(email: &str, password: &str) -> String {
    format!(
        "Welcome login this site by email:{},password:{}",
        email, password
    )
}

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager};
use tokio::time::{sleep, Duration};

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct DownloadStarted<'a> {
    url: &'a str,
    download_id: usize,
    content_length: usize,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct DownloadProgress {
    download_id: usize,
    chunk_length: usize,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct DownloadFinished {
    download_id: usize,
}

#[tauri::command]
pub async fn download(app: AppHandle, url: String) {
    let content_length = 1000;
    let download_id = 1;

    app.emit(
        "download-started",
        DownloadStarted {
            url: &url,
            download_id,
            content_length,
        },
    )
    .unwrap();

    sleep(Duration::from_secs(2)).await;

    for chunk_length in [15, 150, 35, 500, 300] {
        app.emit(
            "download-progress",
            DownloadProgress {
                download_id,
                chunk_length,
            },
        )
        .unwrap();
        sleep(Duration::from_secs(2)).await;
    }

    app.emit("download-finished", DownloadFinished { download_id })
        .unwrap();
}

use crate::errs;
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

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomResponse {
    message: String,
    other_value: usize,
}

async fn some_other_function() -> Option<String> {
    Some("response something".into())
}

#[tauri::command]
pub async fn my_custom_function(
    window: tauri::Window,
    number: usize,
) -> Result<CustomResponse, String> {
    println!("Called from {}", window.label());

    let result = some_other_function().await;
    if let Some(message) = result {
        Ok(CustomResponse {
            message,
            other_value: 42 + number,
        })
    } else {
        Err("No result".into())
    }
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
