use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use crate::constants;
use crate::error::AppError;

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct Config {
    #[serde(default, rename = "currentUser")]
    pub current_user: String,
    #[serde(default, rename = "setupNotRequired")]
    pub setup_not_required: bool,
}

pub type AccountData = HashMap<String, String>;

pub struct AppState {
    pub config: Config,
    pub data: AccountData,
    pub parsec_data_found: bool,
    pub parsecd_found: bool,
}

impl AppState {
    pub fn save_config(&self) -> Result<(), AppError> {
        let json = serde_json::to_string_pretty(&self.config)
            .map_err(|e| AppError::ConfigFileError(e.to_string()))?;
        fs::write(constants::config_path(), json)
            .map_err(|e| AppError::ConfigFileError(e.to_string()))
    }

    pub fn save_data(&self) -> Result<(), AppError> {
        let json = serde_json::to_string_pretty(&self.data)
            .map_err(|e| AppError::ConfigFileError(e.to_string()))?;
        fs::write(constants::data_path(), json)
            .map_err(|e| AppError::ConfigFileError(e.to_string()))
    }
}
