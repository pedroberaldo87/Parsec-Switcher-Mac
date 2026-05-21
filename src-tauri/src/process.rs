use std::process::Command;
use std::thread;
use std::time::Duration;
use crate::error::AppError;

pub fn find_process(name: &str) -> bool {
    Command::new("pgrep")
        .args(["-x", name])
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

pub fn stop_process(name: &str) -> Result<(), AppError> {
    if !find_process(name) {
        return Ok(());
    }
    let output = Command::new("killall")
        .arg(name)
        .output()
        .map_err(|_| AppError::StopFailed)?;
    if output.status.success() {
        Ok(())
    } else {
        Err(AppError::StopFailed)
    }
}

pub fn stop_parsec() -> Result<(), AppError> {
    stop_process("parsecd")?;
    let mut attempts = 0;
    while find_process("parsecd") {
        thread::sleep(Duration::from_millis(500));
        attempts += 1;
        if attempts > 20 {
            return Err(AppError::StopFailed);
        }
    }
    Ok(())
}

pub fn start_parsec() -> Result<(), AppError> {
    let output = Command::new("open")
        .arg("/Applications/Parsec.app")
        .output()
        .map_err(|_| AppError::StartError)?;
    if output.status.success() {
        Ok(())
    } else {
        Err(AppError::StartError)
    }
}
