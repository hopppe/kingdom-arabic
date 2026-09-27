"""Split an Arabic verse into the words that get glossed.

Each word keeps its exact text as it appears in the verse (including attached
punctuation such as «ـ، . :») and its character offsets, because the app finds a
tapped word's gloss by matching that exact text.
"""

import re
from dataclasses import dataclass

ARABIC_LETTER_RE = re.compile("[ء-ي]")
# Punctuation that can be glued to the start or end of a word in this text.
EDGE_PUNCTUATION = "«»\"'“”‘’()[]،؛:.!؟?,;–-"


@dataclass(frozen=True)
class Word:
    """One word of a verse. `raw` is the verse text; `bare` has edge punctuation removed."""

    index: int
    raw: str
    bare: str
    start: int
    end: int


def split_verse(arabic: str) -> list[Word]:
    """Words of a verse in order. Tokens with no Arabic letters (e.g. a lone "–") are skipped."""
    words: list[Word] = []
    for match in re.finditer(r"\S+", arabic):
        raw = match.group(0)
        if not ARABIC_LETTER_RE.search(raw):
            continue
        words.append(
            Word(
                index=len(words),
                raw=raw,
                bare=raw.strip(EDGE_PUNCTUATION),
                start=match.start(),
                end=match.end(),
            )
        )
    return words


def clean_gloss(text: str) -> str:
    """Normalize a model answer: trim, drop wrapping quotes/periods, collapse spaces."""
    gloss = " ".join(text.split())
    gloss = gloss.strip(" \"'“”‘’`")
    gloss = gloss.rstrip(".;,")
    return gloss.strip()


def gloss_problem(gloss: str, max_words: int = 8) -> str | None:
    """Why a gloss is unusable, or None if it is fine."""
    if not gloss:
        return "empty"
    if ARABIC_LETTER_RE.search(gloss):
        return "contains Arabic"
    if len(gloss.split()) > max_words:
        return f"longer than {max_words} words"
    if "\n" in gloss:
        return "multiple lines"
    return None
