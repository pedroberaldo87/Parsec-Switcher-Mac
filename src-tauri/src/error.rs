use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub enum AppError {
    ParsecNotInstalled,
    ParsecdNotInDefault,
    StopFailed,
    NicknameExists,
    StartError,
    FileError(String),
    NicknameNotExists,
    ConfigFileError(String),
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::ParsecNotInstalled => write!(f, "Parsec não está instalado"),
            Self::ParsecdNotInDefault => write!(f, "Parsec não encontrado no local padrão"),
            Self::StopFailed => write!(f, "Falha ao parar o Parsec"),
            Self::NicknameExists => write!(f, "Esse apelido já existe"),
            Self::StartError => write!(f, "Erro ao iniciar o Parsec"),
            Self::FileError(s) => write!(f, "Erro de arquivo: {s}"),
            Self::NicknameNotExists => write!(f, "Apelido não encontrado"),
            Self::ConfigFileError(s) => write!(f, "Erro no arquivo de configuração: {s}"),
        }
    }
}

impl From<AppError> for String {
    fn from(e: AppError) -> Self {
        e.to_string()
    }
}
