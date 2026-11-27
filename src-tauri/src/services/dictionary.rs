//! Lazy offline lookup over the same alphabetic index as the web preview.
use serde_json::{Value, json};
use std::sync::OnceLock;

static SHARDS: [OnceLock<Result<Value, String>>; 27] = [const { OnceLock::new() }; 27];
fn shard(word: &str) -> Result<&'static Value, String> {
    let first = word.as_bytes().first().copied().unwrap_or(b'_');
    let index = if first.is_ascii_lowercase() {
        (first - b'a') as usize
    } else {
        26
    };
    SHARDS[index]
        .get_or_init(|| {
            let source = match index {
                0 => include_str!("../../../public/dictionary/a.json"),
                1 => include_str!("../../../public/dictionary/b.json"),
                2 => include_str!("../../../public/dictionary/c.json"),
                3 => include_str!("../../../public/dictionary/d.json"),
                4 => include_str!("../../../public/dictionary/e.json"),
                5 => include_str!("../../../public/dictionary/f.json"),
                6 => include_str!("../../../public/dictionary/g.json"),
                7 => include_str!("../../../public/dictionary/h.json"),
                8 => include_str!("../../../public/dictionary/i.json"),
                9 => include_str!("../../../public/dictionary/j.json"),
                10 => include_str!("../../../public/dictionary/k.json"),
                11 => include_str!("../../../public/dictionary/l.json"),
                12 => include_str!("../../../public/dictionary/m.json"),
                13 => include_str!("../../../public/dictionary/n.json"),
                14 => include_str!("../../../public/dictionary/o.json"),
                15 => include_str!("../../../public/dictionary/p.json"),
                16 => include_str!("../../../public/dictionary/q.json"),
                17 => include_str!("../../../public/dictionary/r.json"),
                18 => include_str!("../../../public/dictionary/s.json"),
                19 => include_str!("../../../public/dictionary/t.json"),
                20 => include_str!("../../../public/dictionary/u.json"),
                21 => include_str!("../../../public/dictionary/v.json"),
                22 => include_str!("../../../public/dictionary/w.json"),
                23 => include_str!("../../../public/dictionary/x.json"),
                24 => include_str!("../../../public/dictionary/y.json"),
                25 => include_str!("../../../public/dictionary/z.json"),
                26 => include_str!("../../../public/dictionary/_.json"),
                _ => unreachable!(),
            };
            serde_json::from_str(source)
                .map_err(|_| "The offline dictionary could not be loaded.".to_owned())
        })
        .as_ref()
        .map_err(Clone::clone)
}

pub fn lookup(candidates: &[String]) -> Result<Value, String> {
    if candidates.is_empty()
        || candidates.len() > 24
        || candidates
            .iter()
            .any(|s| s.is_empty() || s.chars().count() > 80)
    {
        return Err("Select a single word to look it up.".to_owned());
    }
    for candidate in candidates {
        let data = shard(candidate)?;
        if let Some(entries) = data["entries"].get(candidate) {
            return Ok(json!({"word": candidate, "entries": entries}));
        }
        if let Some(forms) = data["forms"].get(candidate).and_then(Value::as_array) {
            for lemma in forms.iter().filter_map(Value::as_str) {
                if let Some(entries) = shard(lemma)?["entries"].get(lemma) {
                    return Ok(json!({"word": lemma, "entries": entries}));
                }
            }
        }
    }
    Ok(json!({"word": candidates[0], "entries": []}))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn finds_definitions_pronunciations_and_irregular_forms_offline() {
        let paper = lookup(&["paper".into()]).unwrap();
        assert!(!paper["entries"].as_array().unwrap().is_empty());
        assert!(
            paper["entries"][0]["senses"][0]["definition"]
                .as_str()
                .unwrap()
                .len()
                > 10
        );
        assert!(
            !paper["entries"][0]["pronunciations"]
                .as_array()
                .unwrap()
                .is_empty()
        );
        assert_eq!(lookup(&["went".into()]).unwrap()["word"], "go");
    }
    #[test]
    fn missing_words_are_empty_and_invalid_requests_are_rejected() {
        assert_eq!(
            lookup(&["zznotawordzz".into()]).unwrap()["entries"],
            json!([])
        );
        assert!(lookup(&[]).is_err());
        assert!(lookup(&["x".repeat(81)]).is_err());
    }
}
