import React, { memo } from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

const PUNCTUATION_RE = /[.,،؛:؟!«»"]/g;
const stripPunctuation = (text) => text.replace(PUNCTUATION_RE, '');

/** A verse's Arabic text with every occurrence of `word` highlighted. */
function HighlightedVerse({ text, word, numberOfLines }) {
  const { theme } = useTheme();
  const target = stripPunctuation(word);
  const parts = text.split(/(\s+)/);

  return (
    <Text style={[theme.arabic.small, { color: theme.colors.text, textAlign: 'right' }]} numberOfLines={numberOfLines}>
      {parts.map((part, index) =>
        target && stripPunctuation(part) === target ? (
          <Text key={index} style={{ backgroundColor: theme.colors.savedWordBackground, color: theme.colors.text }}>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  );
}

export default memo(HighlightedVerse);
