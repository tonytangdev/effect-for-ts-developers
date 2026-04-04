"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { TOTAL_STEPS } from "@/data/steps";

interface ProgressContextValue {
  completedSteps: Set<number>;
  toggleComplete: (id: number) => void;
  progress: number;
}

const ProgressContext = createContext<ProgressContextValue>({
  completedSteps: new Set(),
  toggleComplete: () => {},
  progress: 0,
});

const STORAGE_KEY = "effect-course-progress";

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCompletedSteps(new Set(JSON.parse(stored)));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedSteps]));
    }
  }, [completedSteps, loaded]);

  const toggleComplete = useCallback((id: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const progress = Math.round((completedSteps.size / TOTAL_STEPS) * 100);

  return (
    <ProgressContext value={{ completedSteps, toggleComplete, progress }}>
      {children}
    </ProgressContext>
  );
}

export function useProgress() {
  return useContext(ProgressContext);
}
