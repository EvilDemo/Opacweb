"use client";

import { createContext, useContext, useSyncExternalStore, ReactNode } from "react";

interface LoaderContextType {
  showInitialLoader: boolean;
  setShowInitialLoader: (show: boolean) => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

const INITIAL_LOAD_KEY = "opac_hasSeenInitialLoad";
const LOADER_CHANGE_EVENT = "opac:loader-change";

function getLoaderSnapshot() {
  try {
    return sessionStorage.getItem(INITIAL_LOAD_KEY) !== "true";
  } catch {
    return false;
  }
}

function subscribeToLoader(onChange: () => void) {
  window.addEventListener(LOADER_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(LOADER_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function setShowInitialLoader(show: boolean) {
  try {
    if (show) sessionStorage.removeItem(INITIAL_LOAD_KEY);
    else sessionStorage.setItem(INITIAL_LOAD_KEY, "true");
    window.dispatchEvent(new Event(LOADER_CHANGE_EVENT));
  } catch {
    // Skip the session loader when browser storage is unavailable.
  }
}

const getServerSnapshot = () => false;

export function LoaderProvider({ children }: { children: ReactNode }) {
  const showInitialLoader = useSyncExternalStore(subscribeToLoader, getLoaderSnapshot, getServerSnapshot);

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
