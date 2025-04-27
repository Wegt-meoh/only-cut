use tauri::{App, WebviewWindow};

const MIN_WIDTH: f64 = 843.0;
const MIN_HEIGHT: f64 = 540.0;

fn create_window(app: &App) {
    let app_handle = app.handle();

    #[cfg(target_os = "windows")]
    let window = tauri::WebviewWindowBuilder::new(
        app_handle,
        "main".to_string(),
        tauri::WebviewUrl::App("index.html".into()),
    )
    .title("Only Cut")
    .inner_size(MIN_WIDTH, MIN_HEIGHT)
    .min_inner_size(MIN_WIDTH, MIN_HEIGHT)
    .decorations(false)
    .maximizable(true)
    .transparent(true)
    .shadow(true)
    .build();

    #[cfg(target_os = "macos")]
    let window = tauri::WebviewWindowBuilder::new(
        app_handle,
        "main".to_string(),
        tauri::WebviewUrl::App("index.html".into()),
    )
    .decorations(true)
    .hidden_title(true)
    .title_bar_style(tauri::TitleBarStyle::Overlay)
    .inner_size(MIN_WIDTH, MIN_HEIGHT)
    .min_inner_size(MIN_WIDTH, MIN_HEIGHT)
    .build();

    #[cfg(target_os = "linux")]
    let window = tauri::WebviewWindowBuilder::new(
        &app_handle,
        "main".to_string(),
        tauri::WebviewUrl::App("index.html".into()),
    )
    .title("Only Cut")
    .decorations(false)
    .inner_size(MIN_WIDTH, MIN_HEIGHT)
    .min_inner_size(MIN_WIDTH, MIN_HEIGHT)
    .transparent(true)
    .build();

    // center the window positon
    center_window_position(&window.unwrap());
}

pub fn start_up(app: &App) {
    create_window(app);
}

pub fn center_window_position(window: &WebviewWindow) {
    let monitor = window.primary_monitor().unwrap().unwrap();
    let monitor_position = monitor.position();
    let window_size = window.outer_size().unwrap();
    let monitor_size = monitor.size();

    let center_x = monitor_position.x + (monitor_size.width - window_size.width) as i32 / 2;
    let center_y = monitor_position.y + (monitor_size.height - window_size.height) as i32 / 2;

    window
        .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: center_x,
            y: center_y,
        }))
        .unwrap();
    let _ = window.show();
    let _ = window.set_focus();
}
