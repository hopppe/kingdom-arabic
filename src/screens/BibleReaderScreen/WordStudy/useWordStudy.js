import { useCallback, useEffect, useState } from 'react';
import { useBibleDb } from '../../../context/BibleDbContext';
import { getRelatedForms, getWordOccurrences } from '../../../data/bibleRepository';

const PAGE_SIZE = 50;

/**
 * Loads where a word form occurs across the Bible and its related forms.
 * `formId` comes from the gloss entry of the tapped word.
 */
export function useWordStudy(formId) {
  const db = useBibleDb();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [state, setState] = useState({ loading: false, error: null, occurrences: null, related: [] });

  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [formId]);

  useEffect(() => {
    if (!formId) return undefined;
    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    Promise.all([getWordOccurrences(db, formId, limit), getRelatedForms(db, formId)])
      .then(([occurrences, related]) => {
        if (!cancelled) setState({ loading: false, error: null, occurrences, related });
      })
      .catch((error) => {
        console.error('Word study lookup failed:', error);
        if (!cancelled) {
          setState({ loading: false, error: 'Could not look up this word.', occurrences: null, related: [] });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [db, formId, limit]);

  const loadMore = useCallback(() => setLimit((current) => current + PAGE_SIZE), []);
  const hasMore = Boolean(state.occurrences && state.occurrences.occurrences.length < state.occurrences.totalCount);

  return { ...state, loadMore, hasMore };
}
