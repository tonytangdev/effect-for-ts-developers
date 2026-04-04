"use client";

import Link from "next/link";
import type { Phase } from "@/data/steps";
import { useProgress } from "./progress-provider";

interface PhaseCardProps {
  phase: Phase;
  index: number;
}

export function PhaseCard({ phase, index }: PhaseCardProps) {
  const { completedSteps } = useProgress();

  const phaseCompleted = phase.steps.filter((s) =>
    completedSteps.has(s.id)
  ).length;
  const phaseTotal = phase.steps.length;
  const phasePct =
    phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;

  return (
    <Link
      href={`/phase/${phase.slug}`}
      className="block border border-border hover:border-accent-dark bg-bg-card p-4 sm:p-5 no-underline text-text transition-all group"
    >
      <div className="flex items-start gap-3">
        <span className="font-serif text-lg text-text-muted min-w-7 pt-0.5">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: phase.phaseColor }}
            />
            <h3 className="text-sm font-medium text-text-heading group-hover:text-accent transition-colors">
              {phase.phase}
            </h3>
          </div>
          <div className="text-[11px] text-text-muted">
            {phase.steps.map((s) => s.title).join(" \u00B7 ")}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1 flex-1 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-dark to-accent transition-all duration-500 rounded-full"
                style={{ width: `${phasePct}%` }}
              />
            </div>
            <span className="text-[10px] text-text-muted flex-shrink-0">
              {phaseCompleted}/{phaseTotal}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
