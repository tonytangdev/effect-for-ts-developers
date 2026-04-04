"use client";

import type { Step } from "@/data/steps";
import { useProgress } from "./progress-provider";

interface StepActionsProps {
  step: Step;
}

export function StepActions({ step }: StepActionsProps) {
  const { completedSteps, toggleComplete } = useProgress();
  const isCompleted = completedSteps.has(step.id);

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <button
        onClick={() => toggleComplete(step.id)}
        className="px-4 py-2 text-[11px] cursor-pointer font-mono transition-all"
        style={{
          background: isCompleted ? "#8B7355" : "#2a2a25",
          border: isCompleted ? "1px solid #8B7355" : "1px solid #3a3a35",
          color: isCompleted ? "#fff" : "#b8b4ac",
        }}
      >
        {isCompleted ? "\u2713 Completed" : "Mark complete"}
      </button>
      <a
        href={step.docsLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-text-muted text-[11px] no-underline border-b border-border pb-px font-mono hover:text-accent transition-colors"
      >
        Read docs &rarr;
      </a>
    </div>
  );
}
