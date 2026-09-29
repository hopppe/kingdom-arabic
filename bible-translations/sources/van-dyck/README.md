# Arabic Van Dyck Bible (Smith–Van Dyck, 1865)

Public domain (CC0). Source: https://github.com/BibleAquifer/ArabicVanDyckBible, release v2026-09-18.

- `usfm/` — all 66 books, fully vowelled. Uses ٱ (alif wasla) where `unified/` uses ا; normalize before comparing.
- `alignments/` — from that release's `Arabic-alignments.zip` (its `viz/` copy is left out):
  - `nt_AVD.tsv`, `ot_AVD.tsv`: Van Dyck words, one per row (`id` = BBCCCVVVWWW).
  - `SBLGNT.tsv`, `WLCM.tsv`: Greek / Hebrew source words with Strong's numbers and English glosses.
  - `links/BB-CCC.alignment.json`: which Van Dyck word ids go with which Greek/Hebrew word ids, one file per chapter.
    Machine-made (Gemini, by Mission Mutual), so treat them as hints, not ground truth.
  - `metadata.json`: license/version metadata for the alignments.
- `metadata.json` — the release's license and version metadata.

Not yet wired into the app; planned as a second Arabic translation after the gemma4 re-translation finishes.
