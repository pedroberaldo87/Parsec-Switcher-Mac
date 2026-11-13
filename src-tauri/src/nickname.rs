//! Validation of account nicknames.
//!
//! A nickname comes from the webview and is used as a folder name under
//! `MultiUser/`. It must never be able to point anywhere else, so it is
//! validated and every path built from it is checked for containment.

use std::path::{Component, Path, PathBuf};
use crate::error::AppError;

/// Longest folder name accepted by APFS/HFS+ (bytes).
const MAX_NICKNAME_BYTES: usize = 255;

/// Rejects empty/blank names, `.` and `..`, path separators (`/`, `\`),
/// control characters (including NUL) and names longer than a folder name can be.
pub fn validate(nickname: &str) -> Result<(), AppError> {
    let invalid = |why: &str| Err(AppError::InvalidNickname(why.to_string()));

    if nickname.trim().is_empty() {
        return invalid("o apelido não pode ser vazio");
    }
    if nickname == "." || nickname == ".." {
        return invalid("apelido reservado");
    }
    if nickname.len() > MAX_NICKNAME_BYTES {
        return invalid("apelido muito longo");
    }
    if nickname.contains(['/', '\\']) {
        return invalid("o apelido não pode conter / ou \\");
    }
    if nickname.chars().any(char::is_control) {
        return invalid("o apelido não pode conter caracteres de controle");
    }
    Ok(())
}

/// Validates `nickname` and returns `base/<nickname>`, after checking that the
/// result is exactly one normal path component below `base`.
pub fn folder_in(base: &Path, nickname: &str) -> Result<PathBuf, AppError> {
    validate(nickname)?;
    let joined = base.join(nickname);
    let relative = joined
        .strip_prefix(base)
        .map_err(|_| AppError::InvalidNickname("caminho fora da pasta de contas".to_string()))?;
    let mut components = relative.components();
    match (components.next(), components.next()) {
        (Some(Component::Normal(_)), None) => Ok(joined),
        _ => Err(AppError::InvalidNickname("caminho fora da pasta de contas".to_string())),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn base() -> PathBuf {
        PathBuf::from("/tmp/parsec-test/MultiUser")
    }

    #[test]
    fn accepts_ordinary_names() {
        for name in ["default", "minha-conta", "Conta 2", "joão", "a.b", "...", ".hidden", "名前", "a:b"] {
            assert!(validate(name).is_ok(), "should accept {name:?}");
            assert_eq!(folder_in(&base(), name).unwrap(), base().join(name));
        }
    }

    #[test]
    fn rejects_empty_and_blank() {
        for name in ["", " ", "   ", "\t"] {
            assert!(validate(name).is_err(), "should reject {name:?}");
        }
    }

    #[test]
    fn rejects_dot_and_dotdot() {
        assert!(validate(".").is_err());
        assert!(validate("..").is_err());
    }

    #[test]
    fn rejects_path_separators() {
        for name in ["a/b", "/etc", "../x", "x/..", "..\\x", "a\\b", "/"] {
            assert!(validate(name).is_err(), "should reject {name:?}");
        }
    }

    #[test]
    fn rejects_control_characters() {
        for name in ["a\0b", "a\nb", "a\rb", "\u{7f}", "x\u{1b}[0m", "a\u{85}b"] {
            assert!(validate(name).is_err(), "should reject {name:?}");
        }
    }

    #[test]
    fn rejects_too_long() {
        assert!(validate(&"a".repeat(255)).is_ok());
        assert!(validate(&"a".repeat(256)).is_err());
    }

    #[test]
    fn folder_in_never_escapes_base() {
        for name in ["..", "../..", "../x", "/etc/passwd", "a/../..", "."] {
            assert!(folder_in(&base(), name).is_err(), "should reject {name:?}");
        }
    }

    #[test]
    fn folder_in_returns_direct_child() {
        let f = folder_in(&base(), "conta").unwrap();
        assert_eq!(f.parent().unwrap(), base());
    }
}
