"""Tests for the word-by-word re-translation (no model needed).

Run from the repo root:  uvx --with requests pytest scripts/retranslate/tests -q
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from prompts import check_prompt, verse_context, word_prompt  # noqa: E402
from verse_gloss import gloss_verse  # noqa: E402
from overlap import find_overlaps  # noqa: E402
from words import clean_gloss, gloss_problem, split_verse  # noqa: E402

JOHN_1_1 = "فِي الْبَدْءِ كَانَ الْكَلِمَةُ، وَالْكَلِمَةُ كَانَ عِنْدَ اللهِ. وَكَانَ الْكَلِمَةُ اللهُ."
JOHN_1_1_EN = "In the beginning was the Word, and the Word was with God, and the Word was God."


class FakeModel:
    """Answers word prompts from a table (by target word number) and the check prompt with `fixes`."""

    def __init__(self, glosses: dict[int, list[str]], fixes: list[dict] | None = None, check_error: bool = False) -> None:
        self.glosses = {n: list(answers) for n, answers in glosses.items()}
        self.fixes = fixes or []
        self.check_error = check_error
        self.prompts: list[str] = []

    def text(self, prompt: str, max_tokens: int, temperature: float) -> str:
        self.prompts.append(prompt)
        number = int(prompt.rsplit("Gloss word ", 1)[1].split(":", 1)[0])
        answers = self.glosses.get(number, ["x"])
        return answers.pop(0) if len(answers) > 1 else answers[0]

    def json(self, prompt: str, schema: dict, max_tokens: int) -> dict:
        self.prompts.append(prompt)
        if self.check_error:
            raise RuntimeError("invalid JSON from model")
        return {"fixes": self.fixes}


def test_split_verse_keeps_raw_text_offsets_and_bare_word() -> None:
    words = split_verse(JOHN_1_1)
    assert [w.raw for w in words][:4] == ["فِي", "الْبَدْءِ", "كَانَ", "الْكَلِمَةُ،"]
    assert words[3].bare == "الْكَلِمَةُ"
    assert all(JOHN_1_1[w.start:w.end] == w.raw for w in words)
    assert [w.index for w in words] == list(range(len(words)))


def test_split_verse_skips_punctuation_only_tokens() -> None:
    words = split_verse("قَالَ – «نَعَمْ»")
    assert [w.bare for w in words] == ["قَالَ", "نَعَمْ"]


def test_clean_gloss_and_problems() -> None:
    assert clean_gloss('  "the  Word."  ') == "the Word"
    assert gloss_problem("") == "empty"
    assert gloss_problem("كلمة") == "contains Arabic"
    assert gloss_problem("one two three four five six seven eight nine") == "longer than 8 words"
    assert clean_gloss("let (the waters) be gathered") == "let be gathered"
    assert clean_gloss("Bore/Fathered") == "Bore"
    assert gloss_problem("he (himself") == "unbalanced parenthesis"
    assert gloss_problem("and his word") is None


def test_word_prompts_share_the_verse_prefix() -> None:
    words = split_verse(JOHN_1_1)
    context = verse_context(JOHN_1_1, JOHN_1_1_EN, words)
    first, second = word_prompt(context, words[0]), word_prompt(context, words[1])
    assert first.startswith(context) and second.startswith(context)
    assert JOHN_1_1_EN in context and "1. فِي" in context
    assert first.endswith("on one line.") and 'Gloss word 2: "الْبَدْءِ"' in second


def test_check_prompt_lists_every_gloss() -> None:
    words = split_verse(JOHN_1_1)[:2]
    prompt = check_prompt("CTX", words, ["in", "the beginning"])
    assert "1. فِي = in" in prompt and "2. الْبَدْءِ = the beginning" in prompt


def test_gloss_verse_glosses_every_word_in_order() -> None:
    words = split_verse(JOHN_1_1)
    model = FakeModel({i + 1: [f"g{i + 1}"] for i in range(len(words))})
    result = gloss_verse(JOHN_1_1, JOHN_1_1_EN, model)
    assert [m["en"] for m in result.mappings] == [f"g{i + 1}" for i in range(len(words))]
    assert [m["ar"] for m in result.mappings] == [w.raw for w in words]
    assert len(model.prompts) == len(words) + 1  # one per word + the check


def test_gloss_verse_retries_bad_answers_then_falls_back() -> None:
    words = split_verse(JOHN_1_1)
    model = FakeModel({1: ["", "في", "in"], 2: ["", "", ""]}, fixes=[])  # 1:1 has no overlaps
    result = gloss_verse(JOHN_1_1, JOHN_1_1_EN, model, previous={words[1].start: "the beginning"})
    assert result.mappings[0]["en"] == "in"
    assert result.mappings[1]["en"] == "the beginning"
    assert result.events[0]["type"] == "fallback"


def test_gloss_verse_applies_valid_check_fixes_only() -> None:
    words = split_verse(JOHN_1_1)
    model = FakeModel(
        {i + 1: ["w"] for i in range(len(words))},
        fixes=[
            {"n": 5, "gloss": "and the Word"},
            {"n": 99, "gloss": "out of range"},
            {"n": 2, "gloss": "كلمة"},
            {"n": 3, "gloss": "W"},  # same as current (case-insensitive): not a change
        ],
    )
    result = gloss_verse(JOHN_1_1, JOHN_1_1_EN, model)
    assert result.mappings[4]["en"] == "and the Word"
    assert [e["type"] for e in result.events] == ["check_fix"]


def test_gloss_verse_without_check_makes_no_check_call() -> None:
    words = split_verse(JOHN_1_1)
    model = FakeModel({i + 1: ["w"] for i in range(len(words))})
    gloss_verse(JOHN_1_1, JOHN_1_1_EN, model, check=False)
    assert len(model.prompts) == len(words)


def test_failed_check_keeps_word_glosses() -> None:
    words = split_verse(JOHN_1_1)
    model = FakeModel({i + 1: [f"g{i + 1}"] for i in range(len(words))}, check_error=True)
    result = gloss_verse(JOHN_1_1, JOHN_1_1_EN, model)
    assert [m["en"] for m in result.mappings] == [f"g{i + 1}" for i in range(len(words))]
    assert result.events == [{"type": "check_failed", "error": "invalid JSON from model"}]


def test_find_overlaps_flags_a_gloss_that_swallows_its_neighbour() -> None:
    assert find_overlaps(["and God saw", "God", "the light"]) == [(0, 1, frozenset({"god"}))]
    assert find_overlaps(["according to", "according to its kinds"]) == [(1, 0, frozenset({"according"}))]
    assert find_overlaps(["in", "the beginning"]) == []
    assert find_overlaps(["holy", "holy"]) == []
    assert find_overlaps(["you accompany me", "for you"]) == []  # only function words shared


def test_overlapping_gloss_is_reasked_once_and_fixed() -> None:
    verse = "وَرَأَى اللهُ النُّورَ"
    model = FakeModel({1: ["and God saw", "and saw"], 2: ["God"], 3: ["the light"]})
    result = gloss_verse(verse, "God saw the light.", model, check=False)
    assert [m["en"] for m in result.mappings] == ["and saw", "God", "the light"]
    assert result.events[0]["type"] == "overlap_fix"
    assert "already glossed" in model.prompts[-1]


def test_overlap_fix_is_dropped_if_it_still_repeats_the_neighbour() -> None:
    verse = "وَرَأَى اللهُ النُّورَ"
    model = FakeModel({1: ["and God saw", "God saw"], 2: ["God"], 3: ["the light"]})
    result = gloss_verse(verse, "God saw the light.", model, check=False)
    assert result.mappings[0]["en"] == "and God saw"
    assert result.events[0]["type"] == "overlap_kept"
