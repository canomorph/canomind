#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::{engine::general_purpose::STANDARD, Engine as _};

#[tauri::command]
fn read_text_file(path: String) -> Result<String, String> { std::fs::read_to_string(&path).map_err(|e| e.to_string()) }

#[tauri::command]
fn write_text_file(path: String, contents: String) -> Result<(), String> { std::fs::write(&path, contents).map_err(|e| e.to_string()) }

// File passed on the command line (double-click on a .canomind file).
#[tauri::command]
fn get_open_path() -> Option<String> { std::env::args().skip(1).find(|a| !a.starts_with('-') && std::path::Path::new(a).is_file()) }

#[tauri::command]
fn list_fonts() -> Vec<String> {
    let mut v = font_kit::source::SystemSource::new().all_families().unwrap_or_default();
    v.sort_by_key(|s| s.to_lowercase());
    v.dedup();
    v
}

#[tauri::command]
fn read_binary_file(path: String) -> Result<String, String> { std::fs::read(&path).map(|b| STANDARD.encode(b)).map_err(|e| e.to_string()) }

#[tauri::command]
fn write_binary_file(path: String, b64: String) -> Result<(), String> { let b = STANDARD.decode(b64).map_err(|e| e.to_string())?; std::fs::write(&path, b).map_err(|e| e.to_string()) }

#[tauri::command]
fn font_bytes(family: String, bold: bool, italic: bool) -> Result<String, String> {
    use font_kit::{family_name::FamilyName, handle::Handle, properties::{Properties, Style, Weight}, source::SystemSource};
    let mut p = Properties::new();
    if bold { p.weight = Weight::BOLD; }
    if italic { p.style = Style::Italic; }
    let h = SystemSource::new().select_best_match(&[FamilyName::Title(family)], &p).map_err(|e| e.to_string())?;
    match h {
        Handle::Path { path, .. } => {
            if path.extension().map(|e| e.to_string_lossy().to_lowercase() == "ttc").unwrap_or(false) { return Err("ttc".into()); }
            std::fs::read(path).map(|b| STANDARD.encode(b)).map_err(|e| e.to_string())
        }
        Handle::Memory { bytes, .. } => Ok(STANDARD.encode(&**bytes)),
    }
}

#[tauri::command]
fn open_url(url: String) -> Result<(), String> {
    if !(url.starts_with("http://") || url.starts_with("https://")) { return Err("unsupported link".into()); }
    #[cfg(target_os = "windows")]
    { std::process::Command::new("rundll32").args(["url.dll,FileProtocolHandler", url.as_str()]).spawn().map_err(|e| e.to_string())?; }
    #[cfg(target_os = "macos")]
    { std::process::Command::new("open").arg(&url).spawn().map_err(|e| e.to_string())?; }
    #[cfg(all(unix, not(target_os = "macos")))]
    { std::process::Command::new("xdg-open").arg(&url).spawn().map_err(|e| e.to_string())?; }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![read_text_file, write_text_file, get_open_path, list_fonts, read_binary_file, write_binary_file, font_bytes, open_url])
        .run(tauri::generate_context!())
        .expect("error while running CanoMind");
}
