"""Prompts for glossing one word at a time and for checking a whole verse.

Every prompt starts with the same instructions, and every word of a verse
shares the same prefix (instructions, the verse, its English translation and
the numbered word list); only the last line names the target word. llama-server
reuses the cached prefix, so the model does not re-read the verse for each word.
"""

from words import Word

INSTRUCTIONS = """You are glossing the Arabic Bible (Van Dyck, fully vowelled) word by word for English-speaking learners. Each gloss appears when a learner taps that word, so it must say what THAT written word means in THIS verse.

Rules:
1. Gloss the whole written word, including everything attached to it:
   - prefixes: وَ = and, فَ = so/then, بِ = in/with/by, لِ = to/for, كَ = like/as, الْ = the, سَ = will
   - pronoun endings: ـهُ = his/him/it, ـهَا = her/it, ـهُمْ = their/them, ـكَ/ـكِ = your/you, ـكُمْ = your/you (plural), ـي/ـنِي = my/me, ـنَا = our/us
   Example: وَكَلِمَتُهُ = "and his word"; فَقَالَ = "so he said"; بِالْحَقِّ = "in the truth".
2. Use the English translation to choose the right sense and wording. When the English words line up with this Arabic word, use those words. When the English paraphrases, give the literal meaning in context.
3. Verbs: include the subject when the verb form carries it (قَالَ = "he said", قُلْتُ = "I said", يَقُولُونَ = "they say").
4. Names of people and places: spell them the way the English translation does.
5. Small words still get a gloss (e.g. أَنَّ = "that", إِلَى = "to", مِنْ = "from", عَلَى = "on").
6. Keep it short: 1 to 5 English words. No explanations, no parentheses, no alternatives with "/", no Arabic, no transliteration."""


def verse_context(arabic: str, english: str, words: list[Word]) -> str:
    numbered = "\n".join(f"{word.index + 1}. {word.bare}" for word in words)
    return (
        f"{INSTRUCTIONS}\n\n"
        f"Arabic verse:\n{arabic}\n\n"
        f"English translation:\n{english}\n\n"
        f"Words of the verse, in order:\n{numbered}\n"
    )


def word_prompt(context: str, word: Word) -> str:
    """Context prefix (identical for every word of the verse) + the target word."""
    return f'{context}\nGloss word {word.index + 1}: "{word.bare}"\nAnswer with only the English gloss on one line.'


def check_prompt(context: str, words: list[Word], glosses: list[str]) -> str:
    lines = "\n".join(f"{word.index + 1}. {word.bare} = {gloss}" for word, gloss in zip(words, glosses))
    return (
        f"{context}\n"
        f"Here is a gloss for every word:\n{lines}\n\n"
        "Check each gloss against the rules, the Arabic verse and the English translation. "
        "A gloss is wrong if it has the wrong meaning for this verse, leaves out an attached part "
        "(and / so / the / in / to / his / their / ...), belongs to a different word, or misspells a name. "
        "Do not change glosses that are correct but worded differently.\n"
        'Answer as JSON: {"fixes": [{"n": word number, "gloss": "corrected gloss"}]} '
        "with an empty list if every gloss is correct."
    )


CHECK_SCHEMA = {
    "type": "object",
    "properties": {
        "fixes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"n": {"type": "integer"}, "gloss": {"type": "string"}},
                "required": ["n", "gloss"],
            },
        }
    },
    "required": ["fixes"],
}
