#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod constants;
mod error;
mod files;
mod process;
mod state;

use std::sync::Mutex;
use state::{AppState, Config, AccountData};
use error::AppError;

fn main() {
    let app_state = bootstrap().expect("Failed to initialize application");

    tauri::Builder::default()
        .manage(Mutex::new(app_state))
        .invoke_handler(tauri::generate_handler![
            commands::initialize,
            commands::list_accounts,
            commands::add_account,
            commands::switch_account,
            commands::delete_account,
            commands::rename_account,
            commands::get_app_version,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn bootstrap() -> Result<AppState, AppError> {
    files::make_dir(&constants::app_data_path())?;
    files::make_dir(&constants::multi_user_path())?;

    let config: Config = if files::check_exists(&constants::config_path()) {
        let content = std::fs::read_to_string(constants::config_path())
            .map_err(|e| AppError::ConfigFileError(e.to_string()))?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        Config::default()
    };

    let data: AccountData = if files::check_exists(&constants::data_path()) {
        let content = std::fs::read_to_string(constants::data_path())
            .map_err(|e| AppError::ConfigFileError(e.to_string()))?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        AccountData::new()
    };

    let parsecd_found = files::check_exists(&constants::parsecd_default_location());
    let parsec_data_found = files::check_exists(&constants::parsec_data_location());

    let mut app_state = AppState {
        config,
        data,
        parsec_data_found,
        parsecd_found,
    };

    if !app_state.config.setup_not_required && parsec_data_found {
        if files::check_exists(&constants::parsec_user_bin()) {
            let default_path = constants::default_user_path();
            files::make_dir(&default_path)?;
            let default_file = default_path.join("user.bin");
            app_state.data.insert("default".to_string(), default_file.to_string_lossy().to_string());
            app_state.config.current_user = "default".to_string();
        }
        app_state.config.setup_not_required = true;
        app_state.save_config()?;
        app_state.save_data()?;
    }

    Ok(app_state)
}
