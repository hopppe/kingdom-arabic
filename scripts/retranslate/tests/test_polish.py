"""Tests for the post-run polish (no model needed).

Run from the repo root:  uvx pytest scripts/retranslate/tests -q
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from polish import polish_chapter, polish_gloss  # noqa: E402


def test_quoted_alternatives_become_slash_choices():
    assert polish_gloss('is" or "does') == "is / does"
    assert polish_gloss('is it" or "has') == "is it / has"
    assert polish_gloss('Rise" or "Get up') == "Rise / Get up"


def test_curly_quotes_and_stray_outer_quotes():
    assert polish_gloss("“is” or “are”") == "is / are"
    assert polish_gloss('"the Lord"') == "the Lord"


def test_three_choices():
    assert polish_gloss('is" or "are" or "do') == "is / are / do"


def test_never_blanks_a_gloss():
    assert polish_gloss("”") == "”"


def test_plain_glosses_untouched():
    for gloss in ["or", "and the water", "is / does", "I will put you in charge of"]:
        assert polish_gloss(gloss) == gloss


def test_polish_chapter_returns_new_data_and_changes():
    chapter = {"verses": {"1": {"mappings": [{"ar": "هَلْ", "en": 'is" or "does'}, {"ar": "أَوْ", "en": "or"}]}}}
    polished, changes = polish_chapter(chapter)
    assert [m["en"] for m in polished["verses"]["1"]["mappings"]] == ["is / does", "or"]
    assert changes == [("1", "هَلْ", 'is" or "does', "is / does")]
    assert chapter["verses"]["1"]["mappings"][0]["en"] == 'is" or "does'  # input not mutated
