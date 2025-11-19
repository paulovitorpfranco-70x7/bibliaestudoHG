import React, { createContext, type PropsWithChildren, useContext } from 'react';
import type { BibleRepository } from '@/domain/repositories/BibleRepository';

const BibleRepositoryContext = createContext<BibleRepository | null>(null);

interface BibleRepositoryProviderProps {
  repository: BibleRepository;
}

export const BibleRepositoryProvider: React.FC<PropsWithChildren<BibleRepositoryProviderProps>> = ({
  repository,
  children,
}) => {
  return (
    <BibleRepositoryContext.Provider value={repository}>
      {children}
    </BibleRepositoryContext.Provider>
  );
};

export const useBibleRepositoryContext = () => {
  const context = useContext(BibleRepositoryContext);
  if (!context) {
    throw new Error('BibleRepositoryContext not found');
  }
  return context;
};
