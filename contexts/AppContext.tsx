'use client';

import React, { createContext, useContext, useState } from 'react';
import type { Condition } from '@/types/app';

interface AppContextValue {
  condition: Condition | null;
  setCondition: (c: Condition) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [condition, setCondition] = useState<Condition | null>('baseline');

  return (
    <AppContext.Provider value={{ condition, setCondition }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
