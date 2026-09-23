import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AppDataContext = createContext(null);

/**
 * Wraps the data providers. `reloadAllData()` remounts them so each one re-reads
 * AsyncStorage, which is how a restored backup takes effect without restarting.
 */
export function AppDataBoundary({ children }) {
  const [generation, setGeneration] = useState(0);
  const reloadAllData = useCallback(() => setGeneration((value) => value + 1), []);
  const value = useMemo(() => ({ reloadAllData }), [reloadAllData]);

  return (
    <AppDataContext.Provider value={value}>
      <React.Fragment key={generation}>{children}</React.Fragment>
    </AppDataContext.Provider>
  );
}

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataBoundary');
  }
  return context;
};
