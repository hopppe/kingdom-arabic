"""Prompts for glossing one word at a time and for checking a whole verse.

Every prompt starts with the same instructions, and every word of a verse
shares the same prefix (instructions, the verse, its English translation and
the numbered word list); only the last line names the target word. llama-server
reuses the cached prefix, so the model does not re-read the verse for each word.
"""

from words import Word

INSTRUCTIONS = """You are glossing a modern, fully vowelled Arabic Bible translation word by word for English-speaking learners. Each gloss appears when a learner taps that word, so it must say what THAT written word means in THIS verse. The English translation is a separate translation (NIV) that often words things differently, so use it for meaning, not as text to copy.

Rules:
1. Gloss the whole written word, including everything attached to it:
   - prefixes: وَ = and, فَ = so/then, بِ = in/with/by, لِ = to/for, كَ = like/as, الْ = the, سَ = will
   - pronoun endings: ـهُ = his/him/it, ـهَا = her/it (them when it refers to a group of animals or things), ـهُمْ = their/them, ـكَ/ـكِ = your/you, ـكُمْ = your/you (plural), ـي/ـنِي = my/me, ـنَا = our/us
   Example: وَكَلِمَتُهُ = "and his word"; فَقَالَ = "so he said"; بِالْحَقِّ = "in the truth".
2. Gloss ONLY this word. Never include the meaning of a neighbouring word, even when the English translation joins them into one phrase.
   Examples: in وَرَأَى اللهُ, وَرَأَى = "and saw" and اللهُ = "God" (not "and God saw"); in وَفْقاً لأَنْوَاعِهَا, وَفْقاً = "according to" and لأَنْوَاعِهَا = "to their kinds"; in إِكْرَاماً لاِسْمِهِ, إِكْرَاماً = "for the sake of" and لاِسْمِهِ = "for his name".
3. Verb subjects: if the subject is its own word in the verse (a noun or name), leave it out of the verb: قَالَ اللهُ = "said" + "God". If there is no subject word, include the pronoun: قَالَ لَهُمْ = "he said" + "to them"; وَهَكَذَا كَانَ = "and so" + "it was"; قُلْتُ = "I said".
   لِـ / لْـ on a present-tense verb has two meanings:
   - a command when the verb ends in sukun (or in kasra because the next word follows): لِيَكُنْ = "let there be", لِتَتَجَمَّعِ = "let be gathered", وَلْتَظْهَرِ = "and let appear";
   - a purpose when the verb ends in fatha: لِتُفَرِّقَ = "to separate", لِيُضِيءَ = "to give light", لِتَكُونَ = "to be".
4. Use the English translation to pick the right sense. When the English uses a different construction, give this word's literal meaning instead (لَسْتُ أَحْتَاجُ is "I am not" + "I need", even if the English says "I lack").
5. Add "the" for الْـ only where natural English would; abstract nouns like death, righteousness, love usually take no "the".
6. Names of people and places: spell them the way the English translation does.
7. Small words still get a gloss (e.g. أَنَّ = "that", إِلَى = "to", مِنْ = "from"). For prepositions use the English one that fits the phrase: عَلَى صُورَتِنَا = "in" + "our image", عَلَى الأَرْضِ = "on" + "the earth".
8. Keep it short: 1 to 5 English words. No explanations, no parentheses, no alternatives with "/", no Arabic, no transliteration."""


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


def overlap_prompt(context: str, word: Word, neighbour: Word, neighbour_gloss: str) -> str:
    """Re-ask one word whose gloss repeated a neighbouring word's meaning."""
    return (
        f'{context}\nGloss word {word.index + 1}: "{word.bare}"\n'
        f'Word {neighbour.index + 1} ("{neighbour.bare}") is already glossed "{neighbour_gloss}", '
        "so leave that meaning out of this gloss (rule 2).\n"
        "Answer with only the English gloss on one line."
    )


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
