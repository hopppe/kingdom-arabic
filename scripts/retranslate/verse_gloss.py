"""Gloss one verse: every word individually, then a check pass over the whole verse.

The model is injected (anything with `text(prompt, max_tokens, temperature)` and
`json(prompt, schema, max_tokens)`), so this logic can be tested without one.
"""

from dataclasses import dataclass, field
from typing import Protocol

from overlap import content_words, find_overlaps
from prompts import CHECK_SCHEMA, check_prompt, overlap_prompt, verse_context, word_prompt
from words import Word, clean_gloss, gloss_problem, split_verse


class Model(Protocol):
    def text(self, prompt: str, max_tokens: int, temperature: float) -> str: ...

    def json(self, prompt: str, schema: dict, max_tokens: int) -> dict: ...

# A deterministic retry would repeat the same bad answer, so retries sample a little.
RETRY_TEMPERATURES = (0.3, 0.6)
WORD_TOKENS = 16
CHECK_TOKENS_PER_WORD = 24


@dataclass
class VerseResult:
    mappings: list[dict]
    events: list[dict] = field(default_factory=list)


def _gloss_word(model: Model, context: str, word: Word, fallback: str) -> tuple[str, dict | None]:
    prompt = word_prompt(context, word)
    problem = "no answer"
    for temperature in (0.0, *RETRY_TEMPERATURES):
        gloss = clean_gloss(model.text(prompt, WORD_TOKENS, temperature))
        problem = gloss_problem(gloss)
        if problem is None:
            return gloss, None
    return fallback, {"type": "fallback", "word": word.raw, "problem": problem, "kept": fallback}


def _fix_overlaps(model: Model, context: str, words: list[Word], glosses: list[str]) -> tuple[list[str], list[dict]]:
    """Re-ask only words whose gloss repeats a neighbour's meaning; keep the fix if it no longer does."""
    fixed = list(glosses)
    events = []
    for index, neighbour, repeated in find_overlaps(glosses):
        prompt = overlap_prompt(context, words[index], words[neighbour], glosses[neighbour])
        gloss = clean_gloss(model.text(prompt, WORD_TOKENS, 0.0))
        resolved = gloss_problem(gloss) is None and not (repeated <= content_words(gloss))
        events.append({
            "type": "overlap_fix" if resolved else "overlap_kept",
            "word": words[index].raw,
            "neighbour": words[neighbour].raw,
            "before": glosses[index],
            "after": gloss if resolved else glosses[index],
        })
        if resolved:
            fixed[index] = gloss
    return fixed, events


def _apply_check(model: Model, context: str, words: list[Word], glosses: list[str]) -> tuple[list[str], list[dict]]:
    try:
        answer = model.json(check_prompt(context, words, glosses), CHECK_SCHEMA, CHECK_TOKENS_PER_WORD * len(words) + 32)
    except RuntimeError as error:
        # A failed check keeps the per-word glosses rather than stopping the run.
        return list(glosses), [{"type": "check_failed", "error": str(error)[:200]}]
    fixed = list(glosses)
    events = []
    for fix in answer.get("fixes", []) or []:
        try:
            index = int(fix.get("n")) - 1
        except (TypeError, ValueError):
            continue
        if not 0 <= index < len(words):
            continue
        gloss = clean_gloss(str(fix.get("gloss", "")))
        if gloss_problem(gloss) is not None or gloss.lower() == fixed[index].lower():
            continue
        events.append({"type": "check_fix", "word": words[index].raw, "before": fixed[index], "after": gloss})
        fixed[index] = gloss
    return fixed, events


def gloss_verse(
    arabic: str, english: str, model: Model, previous: dict[int, str] | None = None, check: bool = True
) -> VerseResult:
    """Gloss every Arabic word of a verse. `previous` maps word start offset -> old gloss (fallback only)."""
    words = split_verse(arabic)
    if not words:
        return VerseResult(mappings=[])
    previous = previous or {}
    context = verse_context(arabic, english, words)

    glosses: list[str] = []
    events: list[dict] = []
    for word in words:
        gloss, event = _gloss_word(model, context, word, previous.get(word.start, ""))
        glosses.append(gloss)
        if event:
            events.append(event)

    glosses, overlap_events = _fix_overlaps(model, context, words, glosses)
    events.extend(overlap_events)

    if check:
        glosses, check_events = _apply_check(model, context, words, glosses)
        events.extend(check_events)

    mappings = [
        {"ar": word.raw, "en": gloss, "start": word.start, "end": word.end}
        for word, gloss in zip(words, glosses)
        if gloss
    ]
    return VerseResult(mappings=mappings, events=events)
