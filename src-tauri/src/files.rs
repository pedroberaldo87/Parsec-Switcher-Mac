use std::fs;
use std::path::Path;
use crate::error::AppError;

pub fn check_exists(path: &Path) -> bool {
    path.exists()
}

pub fn make_dir(path: &Path) -> Result<(), AppError> {
    fs::create_dir_all(path)
        .map_err(|e| AppError::FileError(format!("{}: {}", path.display(), e)))
}

pub fn delete_file(path: &Path) -> Result<(), AppError> {
    fs::remove_file(path)
        .map_err(|e| AppError::FileError(format!("{}: {}", path.display(), e)))
}

pub fn delete_folder(path: &Path) -> Result<(), AppError> {
    fs::remove_dir_all(path)
        .map_err(|e| AppError::FileError(format!("{}: {}", path.display(), e)))
}

pub fn move_path(source: &Path, dest: &Path) -> Result<(), AppError> {
    if let Some(parent) = dest.parent() {
        if !parent.exists() {
            make_dir(parent)?;
        }
    }
    fs::rename(source, dest)
        .map_err(|e| AppError::FileError(format!("{} -> {}: {}", source.display(), dest.display(), e)))
}
