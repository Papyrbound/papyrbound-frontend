use std::{
    collections::HashSet,
    path::{Path, PathBuf},
    sync::Mutex,
};

#[derive(Default)]
pub struct OpenedLibraryFiles {
    pending: Mutex<Vec<String>>,
    allowed: Mutex<HashSet<PathBuf>>,
}

fn supported(path: &Path) -> bool {
    path.extension()
        .and_then(|ext| ext.to_str())
        .is_some_and(|ext| ext.eq_ignore_ascii_case("epub") || ext.eq_ignore_ascii_case("cbz"))
}

impl OpenedLibraryFiles {
    /// Only OS launch arguments and OS drop events authorize a native file read.
    pub fn enqueue(&self, paths: impl IntoIterator<Item = PathBuf>) {
        for path in paths {
            let Ok(path) = path.canonicalize() else {
                continue;
            };
            if !supported(&path) || !path.is_file() {
                continue;
            }
            self.allowed.lock().unwrap().insert(path.clone());
            let path = path.to_string_lossy().into_owned();
            let mut pending = self.pending.lock().unwrap();
            if !pending.contains(&path) {
                pending.push(path);
            }
        }
    }
    pub fn drain(&self) -> Vec<String> {
        std::mem::take(&mut *self.pending.lock().unwrap())
    }
    pub fn read(&self, path: &Path) -> Result<Vec<u8>, String> {
        let path = path
            .canonicalize()
            .map_err(|_| "This file is no longer available.")?;
        if !supported(&path) || !self.allowed.lock().unwrap().contains(&path) {
            return Err("Choose or drop this EPUB/CBZ file before opening it.".into());
        }
        let meta = std::fs::metadata(&path).map_err(|_| "Could not read this file.")?;
        if !meta.is_file() || meta.len() == 0 || meta.len() > 250 * 1024 * 1024 {
            return Err("Choose a non-empty EPUB/CBZ file smaller than 250 MB.".into());
        }
        std::fs::read(path).map_err(|_| "Could not read this file. Check its permissions.".into())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn native_reads_require_an_explicit_supported_file() {
        let root =
            std::env::temp_dir().join(format!("papyrbound-native-test-{}", std::process::id()));
        std::fs::create_dir_all(&root).unwrap();
        let epub = root.join("original.epub");
        let other = root.join("private.txt");
        std::fs::write(&epub, b"original bytes").unwrap();
        std::fs::write(&other, b"private").unwrap();
        let files = OpenedLibraryFiles::default();
        assert!(files.read(&epub).is_err());
        files.enqueue([epub.clone(), other.clone(), epub.clone()]);
        assert_eq!(files.drain().len(), 1);
        assert!(files.drain().is_empty());
        assert_eq!(files.read(&epub).unwrap(), b"original bytes");
        assert!(files.read(&other).is_err());
        std::fs::remove_file(epub).unwrap();
        std::fs::remove_file(other).unwrap();
        std::fs::remove_dir(root).unwrap();
    }
}
