import React from 'react';
import { Text } from 'react-native';

// Helper to highlight word in verse text
export const highlightWordInVerse = (verseText, word, textStyle) => {
  if (!verseText || !word) return <Text style={textStyle}>{verseText}</Text>;

  // Try exact match first
  let parts = verseText.split(word);
  let matchedWord = word;

  // If no exact match, try case-insensitive
  if (parts.length === 1) {
    const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const matches = verseText.match(regex);
    if (matches && matches.length > 0) {
      matchedWord = matches[0];
      parts = verseText.split(matchedWord);
    }
  }

  // Still no match, return plain text
  if (parts.length === 1) {
    return <Text style={textStyle}>{verseText}</Text>;
  }

  return (
    <Text style={textStyle}>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <Text style={{ fontWeight: 'bold', backgroundColor: 'rgba(255, 255, 0, 0.3)' }}>{matchedWord}</Text>
          )}
        </React.Fragment>
      ))}
    </Text>
  );
};
