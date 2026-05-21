use std::path::PathBuf;

fn home_dir() -> PathBuf {
    dirs::home_dir().expect("Could not determine home directory")
}

pub fn app_data_path() -> PathBuf {
    home_dir().join("Library/Application Support/parsec-switcher")
}

pub fn config_path() -> PathBuf {
    app_data_path().join("config.json")
}

pub fn data_path() -> PathBuf {
    app_data_path().join("account_data.json")
}

pub fn multi_user_path() -> PathBuf {
    app_data_path().join("MultiUser")
}

pub fn default_user_path() -> PathBuf {
    multi_user_path().join("default")
}

pub fn parsec_data_location() -> PathBuf {
    home_dir().join(".parsec")
}

pub fn parsec_user_bin() -> PathBuf {
    parsec_data_location().join("user.bin")
}

pub fn parsecd_default_location() -> PathBuf {
    PathBuf::from("/Applications/Parsec.app/Contents/MacOS/parsecd")
}
