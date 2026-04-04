"use client";

import Link from "next/link";
import { PHASES, TOTAL_STEPS } from "@/data/steps";
import { useProgress } from "./progress-provider";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { completedSteps } = useProgress();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[85%] max-w-[360px] bg-bg border-r border-border overflow-y-auto p-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-serif text-lg m-0">Progress</h2>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-text-muted text-lg cursor-pointer"
          >
            &times;
          </button>
        </div>
        <div className="text-[32px] font-serif text-accent mb-1">
          {completedSteps.size}/{TOTAL_STEPS}
        </div>
        <p className="text-[11px] text-text-muted mb-6">steps completed</p>

        {PHASES.map((phase) => (
          <div key={phase.slug} className="mb-4">
            <div
              className="text-[10px] uppercase tracking-[2px] mb-2 font-semibold"
              style={{ color: phase.phaseColor }}
            >
              {phase.phase}
            </div>
            {phase.steps.map((step) => (
              <Link
                key={step.id}
                href={`/phase/${phase.slug}#step-${step.id}`}
                onClick={onClose}
                className="flex items-center gap-2 py-1.5 cursor-pointer no-underline text-text"
                style={{ opacity: completedSteps.has(step.id) ? 0.5 : 1 }}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] text-white"
                  style={{
                    border: completedSteps.has(step.id)
                      ? "none"
                      : "1px solid #555",
                    background: completedSteps.has(step.id)
                      ? "#8B7355"
                      : "transparent",
                  }}
                >
                  {completedSteps.has(step.id) && "\u2713"}
                </span>
                <span
                  className="text-xs"
                  style={{
                    textDecoration: completedSteps.has(step.id)
                      ? "line-through"
                      : "none",
                  }}
                >
                  {step.title}
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
