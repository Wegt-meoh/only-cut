#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error("Failed to parse as string: {0}")]
    Utf8(#[from] std::str::Utf8Error),
    #[error(transparent)]
    Tauri(tauri::Error),
}

#[derive(serde::Serialize)]
#[serde(tag = "kind", content = "message")]
#[serde(rename_all = "camelCase")]
enum ErrorKind {
    Io(String),
    Utf8(String),
    Tauri(String),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        let error_message = self.to_string();
        let error_kind = match self {
            Self::Io(_) => ErrorKind::Io(error_message),
            Self::Utf8(_) => ErrorKind::Utf8(error_message),
            Self::Tauri(_) => ErrorKind::Tauri(error_message),
        };
        error_kind.serialize(serializer)
    }
}

impl From<tauri::Error> for Error {
    fn from(err: tauri::Error) -> Self {
        Error::Tauri(err)
    }
}
