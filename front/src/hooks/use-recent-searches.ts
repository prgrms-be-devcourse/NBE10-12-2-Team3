"use client";

import { useState, useEffect } from "react";

const RECENT_SEARCHES_KEY = "scommit_recent_searches";
const MAX_RECENT_SEARCHES = 5;

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          setRecentSearches(JSON.parse(stored));
        } else {
          setRecentSearches([]);
        }
      } catch (error) {
        console.error("Failed to load recent searches:", error);
        setRecentSearches([]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const addSearchTerm = (term: string) => {
    if (!term.trim()) return;
    
    setRecentSearches((prev) => {
      // 기존에 있던 단어라면 제거하고 맨 앞으로 올림
      const filtered = prev.filter((item) => item !== term);
      const newSearches = [term, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
      } catch (error) {
        console.error("Failed to save recent search:", error);
      }
      return newSearches;
    });
  };

  const removeSearchTerm = (term: string) => {
    setRecentSearches((prev) => {
      const newSearches = prev.filter((item) => item !== term);
      
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
      } catch (error) {
        console.error("Failed to update recent searches:", error);
      }
      return newSearches;
    });
  };

  return {
    recentSearches,
    addSearchTerm,
    removeSearchTerm,
    isMounted,
  };
}
