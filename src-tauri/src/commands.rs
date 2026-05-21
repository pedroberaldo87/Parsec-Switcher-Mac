use std::sync::Mutex;
use tauri::State;
use serde::Serialize;
use crate::state::AppState;
use crate::error::AppError;
use crate::constants;
use crate::files;
use crate::process;

#[derive(Serialize)]
pub struct AccountList {
    pub accounts: Vec<String>,
    pub current_user: String,
}

#[derive(Serialize)]
pub struct InitResult {
    pub parsec_data_found: bool,
    pub parsecd_found: bool,
}

#[tauri::command]
pub fn initialize(state: State<'_, Mutex<AppState>>) -> Result<InitResult, String> {
    let state = state.lock().unwrap();
    Ok(InitResult {
        parsec_data_found: state.parsec_data_found,
        parsecd_found: state.parsecd_found,
    })
}

#[tauri::command]
pub fn list_accounts(state: State<'_, Mutex<AppState>>) -> Result<AccountList, String> {
    let state = state.lock().unwrap();
    Ok(AccountList {
        accounts: state.data.keys().cloned().collect(),
        current_user: state.config.current_user.clone(),
    })
}

#[tauri::command]
pub fn add_account(nickname: String, state: State<'_, Mutex<AppState>>) -> Result<(), String> {
    let mut state = state.lock().unwrap();
    if state.data.contains_key(&nickname) {
        return Err(AppError::NicknameExists.into());
    }
    process::stop_parsec().map_err(String::from)?;
    switch_account_data(&mut state, &nickname).map_err(String::from)?;
    process::start_parsec().map_err(String::from)?;
    state.save_config().map_err(String::from)?;
    state.save_data().map_err(String::from)?;
    Ok(())
}

#[tauri::command]
pub fn switch_account(nickname: String, state: State<'_, Mutex<AppState>>) -> Result<(), String> {
    let mut state = state.lock().unwrap();
    if !state.data.contains_key(&nickname) {
        return Err(AppError::NicknameNotExists.into());
    }
    process::stop_parsec().map_err(String::from)?;
    switch_account_data(&mut state, &nickname).map_err(String::from)?;
    process::start_parsec().map_err(String::from)?;
    state.save_config().map_err(String::from)?;
    state.save_data().map_err(String::from)?;
    Ok(())
}

#[tauri::command]
pub fn delete_account(nickname: String, state: State<'_, Mutex<AppState>>) -> Result<(), String> {
    let mut state = state.lock().unwrap();
    if !state.data.contains_key(&nickname) {
        return Err(AppError::NicknameNotExists.into());
    }

    state.data.remove(&nickname);

    let user_folder = constants::multi_user_path().join(&nickname);
    if files::check_exists(&user_folder) {
        files::delete_folder(&user_folder).map_err(String::from)?;
    }

    if state.config.current_user == nickname {
        process::stop_parsec().map_err(String::from)?;
        let parsec_user = constants::parsec_user_bin();
        if files::check_exists(&parsec_user) {
            files::delete_file(&parsec_user).map_err(String::from)?;
        }
        if state.data.is_empty() {
            state.config.current_user = String::new();
        } else {
            let next_user = state.data.keys().next().unwrap().clone();
            switch_account_data(&mut state, &next_user).map_err(String::from)?;
        }
        process::start_parsec().map_err(String::from)?;
    }

    state.save_config().map_err(String::from)?;
    state.save_data().map_err(String::from)?;
    Ok(())
}

#[tauri::command]
pub fn rename_account(old_nickname: String, new_nickname: String, state: State<'_, Mutex<AppState>>) -> Result<(), String> {
    let mut state = state.lock().unwrap();
    if !state.data.contains_key(&old_nickname) {
        return Err(AppError::NicknameNotExists.into());
    }
    if state.data.contains_key(&new_nickname) {
        return Err(AppError::NicknameExists.into());
    }

    let old_folder = constants::multi_user_path().join(&old_nickname);
    let new_folder = constants::multi_user_path().join(&new_nickname);
    let new_file_path = new_folder.join("user.bin");

    if files::check_exists(&old_folder) {
        files::move_path(&old_folder, &new_folder).map_err(String::from)?;
    }

    state.data.remove(&old_nickname);
    state.data.insert(new_nickname.clone(), new_file_path.to_string_lossy().to_string());

    if state.config.current_user == old_nickname {
        state.config.current_user = new_nickname;
    }

    state.save_config().map_err(String::from)?;
    state.save_data().map_err(String::from)?;
    Ok(())
}

#[tauri::command]
pub fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

fn switch_account_data(state: &mut AppState, nickname: &str) -> Result<(), AppError> {
    let parsec_user = constants::parsec_user_bin();

    if !state.config.current_user.is_empty() {
        let current_dir = constants::multi_user_path().join(&state.config.current_user);
        let current_file = current_dir.join("user.bin");
        if files::check_exists(&parsec_user) {
            files::move_path(&parsec_user, &current_file)?;
        }
    }

    let nickname_folder = constants::multi_user_path().join(nickname);
    let nickname_file = nickname_folder.join("user.bin");

    if !files::check_exists(&nickname_folder) {
        files::make_dir(&nickname_folder)?;
    }
    if files::check_exists(&nickname_file) {
        files::move_path(&nickname_file, &parsec_user)?;
    }

    if !state.data.contains_key(nickname) {
        state.data.insert(nickname.to_string(), nickname_file.to_string_lossy().to_string());
    }

    state.config.current_user = nickname.to_string();
    Ok(())
}
