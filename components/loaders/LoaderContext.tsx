"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LoaderContextType {
  showInitialLoader: boolean;
  setShowInitialLoader: (show: boolean) => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

const INITIAL_LOAD_KEY = "opac_hasSeenInitialLoad";

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [showInitialLoader, setShowInitialLoader] = useState(false);

  useEffect(() => {
    const hasSeenInitialLoad = sessionStorage.getItem(INITIAL_LOAD_KEY);
    if (!hasSeenInitialLoad) {
      sessionStorage.setItem(INITIAL_LOAD_KEY, "true");
      setShowInitialLoader(true);
    }
  }, []);

  return (
    <LoaderContext.Provider value={{ showInitialLoader, setShowInitialLoader }}>{children}</LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
}
