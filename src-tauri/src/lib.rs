// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod cmds;
mod errs;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            cmds::greet,
            cmds::login,
            cmds::download,
            cmds::load_image,
            cmds::my_custom_function,
            cmds::ffprobe
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
