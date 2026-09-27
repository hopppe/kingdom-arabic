"""Find glosses that repeat a neighbouring word's meaning.

The model sometimes folds a neighbour into a gloss because the English
translation joins them into one phrase: وَرَأَى = "and God saw" next to
اللهُ = "God", or لأَنْوَاعِهَا = "according to its kinds" after
وَفْقاً = "according to". Those words get re-asked with a note; nothing else
is re-reviewed.
"""

import re

# Function words shared by many glosses; overlap on these alone means nothing.
STOPWORDS = frozenset(
    "the a an and so then of to in on at for with by from that this these those it is was be been "
    "he she they them him his her their its i me my we us our you your not no as also who which "
    "will shall has have had do did".split()
)


def content_words(gloss: str) -> frozenset[str]:
    words = re.findall(r"[a-z']+", gloss.lower().replace("’", "'"))
    return frozenset(word.removesuffix("'s") for word in words) - STOPWORDS


def find_overlaps(glosses: list[str]) -> list[tuple[int, int, frozenset[str]]]:
    """(word index, neighbour index, repeated words) for each gloss that contains
    all of a neighbour's content words plus more of its own."""
    found = []
    for index, gloss in enumerate(glosses):
        own = content_words(gloss)
        for neighbour in (index - 1, index + 1):
            if not 0 <= neighbour < len(glosses):
                continue
            theirs = content_words(glosses[neighbour])
            if theirs and theirs < own and gloss.lower() != glosses[neighbour].lower():
                found.append((index, neighbour, theirs))
                break
    return found
