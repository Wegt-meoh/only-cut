use tauri::App;

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
    .decorations(true)
    .maximizable(true)
    .transparent(true)
    .shadow(true)
    .build();

    #[cfg(target_os = "macos")]
    app_handle
        .set_activation_policy(tauri::ActivationPolicy::Accessory)
        .unwrap();

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

    let window = window.unwrap();
    let _ = window.show();
    let _ = window.set_focus();
}

pub fn start_up(app: &App) {
    create_window(app);
}
