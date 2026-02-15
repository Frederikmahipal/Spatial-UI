'use client';

import React, { createContext, useContext, useState } from 'react';
import type { Condition } from '@/types/experiment';

interface ExperimentContextValue {
  condition: Condition | null;
  setCondition: (c: Condition) => void;
}

const ExperimentContext = createContext<ExperimentContextValue | null>(null);

export function ExperimentProvider({ children }: { children: React.ReactNode }) {
  const [condition, setCondition] = useState<Condition | null>(null);

  return (
    <ExperimentContext.Provider value={{ condition, setCondition }}>
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperiment() {
  const ctx = useContext(ExperimentContext);
  if (!ctx) throw new Error('useExperiment must be used within ExperimentProvider');
  return ctx;
}
