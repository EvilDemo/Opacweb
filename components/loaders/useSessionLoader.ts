"use client";

import { useState } from "react";

const INITIAL_LOAD_KEY = "opac_hasSeenInitialLoad";

export function useSessionLoader() {
  const [isInitialPageLoad] = useState(() => {
    if (typeof window !== "undefined") {
      const hasSeenInitialLoad = sessionStorage.getItem(INITIAL_LOAD_KEY);
      if (!hasSeenInitialLoad) {
        sessionStorage.setItem(INITIAL_LOAD_KEY, "true");
        return true;
      }
    }
    return false;
  });

  return { isInitialPageLoad };
}

