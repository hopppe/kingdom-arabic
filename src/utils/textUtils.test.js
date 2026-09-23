import { findWholeWordMatch } from './textUtils';

const matchedText = (text, phrase) => {
  const match = findWholeWordMatch(text, phrase);
  return match ? text.split(/(\s+)/).slice(match.start, match.end + 1).join('') : null;
};

describe('findWholeWordMatch', () => {
  it('matches a standalone Arabic word, not the same letters inside a longer word', () => {
    // لِي must not match the ending of قُولِي
    expect(matchedText('قُولِي عَنِّي هُوَ أَخِي لِي', 'لِي')).toBe('لِي');
    expect(findWholeWordMatch('قُولِي عَنِّي', 'لِي')).toBeNull();
  });

  it('ignores attached punctuation', () => {
    expect(matchedText('وَكَانَ الْكَلِمَةُ، اللهَ.', 'الْكَلِمَةُ')).toBe('الْكَلِمَةُ،');
  });

  it('matches multi-word English glosses case-insensitively', () => {
    expect(matchedText('For God so loved the world, that he gave', 'The world')).toBe('the world,');
  });

  it('does not match inside English words', () => {
    expect(findWholeWordMatch('He was preaching', 'reach')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(findWholeWordMatch('', 'x')).toBeNull();
    expect(findWholeWordMatch('text', '')).toBeNull();
  });
});
