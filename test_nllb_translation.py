#!/usr/bin/env python3
"""
Test NLLB-200 model for Arabic-English word translation
This should produce much better results than LibreTranslate's Argos models
"""

import json

# Test words from Mark 1:1 that LibreTranslate got wrong
test_words = [
    "هَذِهِ",      # Should be "this", not "here"
    "بِدَايَةُ",    # Should be "beginning" ✓
    "إِنْجِيلِ",    # Should be "gospel/good news", not "run"!
    "يَسُوعَ",      # Should be "Jesus" ✓
    "الْمَسِيحِ",   # Should be "Christ/Messiah", not "Jesus"
    "ابْنِ",       # Should be "son" ✓
    "اللهِ",       # Should be "God" ✓
]

# Test words from John 3:16 that LibreTranslate got catastrophically wrong
test_words_jhn = [
    "لأَنَّهُ",     # Should be "for", not "for him"
    "هكَذَا",       # Should be "so/thus", not "here"
    "أَحَبَّ",      # Should be "loved", not "I love"
    "اللهُ",        # Should be "God" ✓
    "الْعَالَمَ",   # Should be "the world" ✓
    "حَتَّى",       # Should be "that/so that", not "even"
    "بَذَلَ",       # Should be "gave", not "yes"!!!
    "ابْنَهُ",      # Should be "his son" ✓
    "الْوَحِيدَ",   # Should be "only/unique" ✓
    "يَهْلِكَ",     # Should be "perish", not "hallucinates"!!!
    "كُلُّ",        # Should be "all/every", not "eat"!!!
]

print("=" * 60)
print("Testing NLLB-200 Model for Arabic-English Translation")
print("=" * 60)

try:
    from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

    print("\n📦 Loading NLLB-200 model (this may take a moment)...")
    print("   Model: facebook/nllb-200-distilled-600M")

    model_name = "facebook/nllb-200-distilled-600M"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

    # NLLB language codes
    # Arabic: ara_Arab
    # English: eng_Latn

    def translate_word(arabic_word):
        """Translate a single Arabic word using NLLB"""
        inputs = tokenizer(arabic_word, return_tensors="pt")

        # Set source and target language codes
        translated_tokens = model.generate(
            **inputs,
            forced_bos_token_id=tokenizer.lang_code_to_id["eng_Latn"],
            max_length=50
        )

        translation = tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)[0]
        return translation

    print("\n✅ Model loaded successfully!\n")

    print("Testing Mark 1:1 words:")
    print("-" * 60)
    for word in test_words:
        translation = translate_word(word)
        print(f"  {word:15} → {translation}")

    print("\n\nTesting John 3:16 words:")
    print("-" * 60)
    for word in test_words_jhn:
        translation = translate_word(word)
        print(f"  {word:15} → {translation}")

    print("\n" + "=" * 60)
    print("✅ Test complete!")
    print("=" * 60)

except ImportError:
    print("\n❌ Error: transformers library not installed")
    print("\nTo install, run:")
    print("  pip install transformers torch sentencepiece")
    print("\nNote: This will download ~600MB model on first run")

except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
