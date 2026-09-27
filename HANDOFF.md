# Handoff — Bible gloss review work (2026-09-22/23)

Context for an agent picking up the Arabic→English word-mapping quality work.
Repo conventions live in `CLAUDE.md`; this file covers only what changed in this
session and what is still in flight.

---

## 1. State of the working tree

**Uncommitted and intentional — do not revert without asking the user.**

| path | state |
|---|---|
| `bible-translations/mappings/{MAT,MRK,LUK,JHN}/*.json` | **962 gloss corrections applied**, 88 files, diff is exactly 962 +/- lines |
| `bible-translations/review-v2-gemma4-12b/` | review proposals (95 gospel chapters), untracked (not gitignored) — not applied |
| `bible-translations/review-gemma4-12b/` | **dead output from a rejected approach — safe to delete** |
| `scripts/review_mappings_v2.py` | the working reviewer |
| `scripts/apply_gloss_review.py` | applies proposals back into `mappings/` |
| `scripts/test_review_quality.py` | 19 unit tests for the quality gates |
| `scripts/overnight_review.sh` | nightly runner |
| `scripts/benchmark_translation_models.py` | model bake-off harness |

Nothing has been committed. `git diff -- bible-translations/mappings` shows the
applied corrections; `git checkout` reverts them.

---

## 2. Scheduled job — running unattended

Two one-shot launchd jobs (the old nightly `com.ethan.bible-review` was removed 2026-09-23):
- `com.ethan.bible-review.wed-night` — 00:00 Thu 2026-09-24, **8 h** budget
- `com.ethan.bible-review.thu-night` — 00:00 Fri 2026-09-25, **10 h** budget (the rest)

Each unloads itself after it runs; a `COMPLETE:` run unloads any later ones too.
A live test on 2026-09-23 measured ~3.5–5 s/verse, so ~12,480 verses ≈ 12–17 h, and the
18 h of budget should cover it. If `REMAINING:` shows up Friday morning, schedule one more night.

- Order is **remaining NT books first, then OT**.
- Resumable: re-running skips chapters already written. A chapter interrupted
  mid-way is **discarded, not flushed**, so it gets redone (this was a bug; fixed).
- Ollama errors (HTTP error / `{"error":...}` body) retry 3× with backoff, then
  stop the run cleanly. Before 2026-09-23 an error was read as "no corrections"
  and the chapter was saved as done; chapter files are now written atomically.
- Order really is NT-first now. Before the 2026-09-23 fix the queue was a string sort
  (1CH, 1CO, 1JN, ...); that early 1CH/3JN output was deleted and will be redone.
- Logs: `logs/overnight_review_*.log`.

Stop it with
`launchctl unload ~/Library/LaunchAgents/com.ethan.bible-review.*.plist`.

**Preflight gates** (any failure aborts before the 6h run): SSD mounted, mappings
present, Python + deps, ≥2 GB free on the SSD, ≥30 GB free on the internal disk,
TurboFieldfare not running, other Ollama models unloaded, Ollama reachable (starts it if not),
`gemma4:12b` installed, a canary prompt answered correctly, and
`test_review_quality.py` passing.

---

## 3. How the reviewer works, and why

**Do not replace this with "ask an LLM to review every gloss." That was tried and
measured, and it is net-harmful.** See §5.

Three-stage design in `review_mappings_v2.py`:

1. **Deterministic detection, no model.** Flags ~6% of glosses:
   - *consistency outliers* — the same Arabic word glossed differently from a ≥50%
     corpus majority, in ≤2 places. (هَذَا is glossed `'this'` 245×, so the 5 saying
     `'Man'` / `'It'` are provably wrong.)
   - *mechanical breakage* — unresolved slashes (`'Bore/Fathered'`), parentheticals,
     bare articles, Arabic left in the gloss, ≥6-word phrases, empties.
2. **Model adjudicates only those**, receiving the full Arabic verse, the full
   English verse, and **the corpus-majority gloss**, and choosing rather than
   inventing. `KEEP` is allowed and used ~2/3 of the time.
3. **Quality gate** between model and disk (see §4).

Key flags:
```bash
python3 scripts/review_mappings_v2.py ALL --skip MAT,MRK,LUK,JHN --detect-all --max-hours 6
```
`--detect-all` computes majorities across all 66 books (better statistics) while
`--skip` limits what gets reviewed.

---

## 4. Quality gates — `quality_check()` in `review_mappings_v2.py`

Built from failure modes actually observed. **Hard reject:** empty, Arabic in the
proposal, truncation (`'with the Spirit'`→`'with the'`), dangling article
(`'for forgiveness'`→`'for the'`), content-word loss *not* backed by the corpus
majority, no-op, >8-word phrase, a proposal still containing `/` or parentheses, dropping
"and" when the corpus majority has it.
**Soft warn** (written out, tagged for human review): dropped pronoun, ambiguous
"and" removal.

`scripts/test_review_quality.py` asserts the gates block 8 known corruption modes
**and do not block 9 genuine fixes**. Run it after touching `quality_check()` —
the nightly job refuses to start if it fails.

The corpus-majority parameter is load-bearing: it is what distinguishes the
valuable alignment fix (`فِي 'Three'`→`'in'`) from corruption (`'for the'`).

---

## 5. Measured findings — don't redo these experiments

**Translation model: keep `gemma3:12b`** in `process_old_testament_mappings.py`
and `validate_alignment_ollama.py`.

| model | agreement | format-clean | words/s |
|---|---|---|---|
| gemma3:12b | 76.6% | 25/25 | 0.92 |
| gemma4:12b | 70.3% | 25/25 | 1.09 |
| qwen3.5:9b | 54.4% | 14/25 | 1.16 |

⚠️ **Caveat the user correctly raised:** the "gold" data was itself generated by
gemma3, so this scores self-agreement, not accuracy. The ranking is *not* proven.
What does survive: qwen3.5 fails structurally (returned 10 lines for 17 words —
it re-segments verses into phrases), and the speed figures are clean. A fair
rerun would need blind adjudication against the Arabic, not against the mappings.

**Review approaches, by measured precision:**

| approach | precision | speed | verdict |
|---|---|---|---|
| open-ended "is this wrong?" over everything | ~37% | 8.0 h | **rejected** — 33% stylistic churn, 30% regressions |
| one word per request, "include prefixes" | worse | 42 h | **rejected** — instruction caused hallucinated prefixes (`'leather'`→`'with a leather'`) |
| targeted detection + corpus anchor | **~80–85%** | 1.6 h | **shipped** |

Precision figures come from hand-adjudicating ~50 corrections across two samples.
**Validate by hand-adjudicating ~25 proposals before scaling any change** — both
rejected approaches looked fine in aggregate and were harmful on inspection.

Gospel error rate: **~6% flagged, ~2% mechanically broken.** The data is ~94%
clean; the 19%-flagging approach was mostly rewriting correct work.

---

## 6. Applying proposals

```bash
python3 scripts/apply_gloss_review.py                      # dry run (default)
python3 scripts/apply_gloss_review.py --reason unresolved_slash,bare_article --apply
python3 scripts/apply_gloss_review.py --apply              # everything
python3 scripts/apply_gloss_review.py --skip-warnings --apply  # leave warn-tagged ones for a human
```

Per-correction safety checks: the Arabic at that index must still match what was
reviewed, the current gloss must not have drifted, and the proposal must be
non-empty/ASCII-ish/≤60 chars. Failures are skipped and reported.

**Write JSON with `indent=2`** — the source files use it. Writing `indent=1`
reformats every file and buries the real diff in ~329k lines. (Hit and fixed.)

---

## 7. Machine constraints — read before running anything

**16 GB M4 Mac mini. Run ONE model at a time.** The user's crashes were swap
exhaustion: two always-on LLM servers (Ollama + a TurboFieldfare assistant holding
a 13 GB model) drove swap to 25.4/25.6 GB with the internal disk 93% full. Ollama
dropped to **3 tok/s**; after freeing memory it runs at **11 tok/s** — a bigger win
than any model swap.

- Check before long jobs: `sysctl vm.swapusage`, `ollama ps`
- Unload: `curl -s localhost:11434/api/generate -d '{"model":"<name>","keep_alive":0}'`
- TurboFieldfare (`com.ethan.turbofieldfare-server`) is **deliberately disabled**.
  Do not re-enable it while a review job is running.
- Keep the internal disk above ~30 GB free; macOS swap lives there.

**Local AI storage** is consolidated under `/Volumes/ssd-mac-storage/AI/` — see
`AI/README.md`. Models in `AI/models/{ollama,huggingface,comfyui,qwen3-tts,...}`;
launchers source `AI/ai-env.sh`, which refuses to start if the SSD is unmounted.
Docker was uninstalled this session. LTX-2 was deleted (~64 GB).

---

## 8. Open items

0. Two gospel glosses slipped past the old gates and were applied: LUK 11:52 `'Neither/Nor'`
   and LUK 23:44 `'(the twelfth'`. Hand-fixed to `'Neither'` / `'the twelfth'` on 2026-09-23;
   the new `still_broken` gate blocks this class.
   Also fixed: the truncation gate rejected valid slash resolutions
   (`'Gave/Presented'`→`'gave'`); it now skips glosses that contain `/` or parentheses.

1. **The nightly job needs ~2 more nights.** Check `logs/overnight_review_*.log`
   for `COMPLETE:` or `REMAINING:`.
2. **OT proposals are unreviewed.** The gospels were hand-validated at ~80–85%
   precision; the OT is messier (10,247 unresolved slashes vs 156 in the gospels)
   and the OT mappings were gemma3-generated, so **sample-adjudicate before
   applying** rather than trusting the gospel precision figure.
3. **Nothing is committed.** The user has not been asked about committing.
4. `bible-translations/review-gemma4-12b/` is dead output; delete when convenient.
5. A blind model bake-off (§5 caveat) was offered and not yet run.
