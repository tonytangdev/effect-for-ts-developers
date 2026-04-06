import { PHASES, TOTAL_STEPS, TOTAL_HOURS } from "@/data/steps";
import { ProgressProvider } from "@/components/progress-provider";
import { Header } from "@/components/header";
import { PhaseCard } from "@/components/phase-card";

export default function HomePage() {
  return (
    <ProgressProvider>
      <Header />
      <main className="px-4 sm:px-6 py-8 pb-20 max-w-2xl mx-auto w-full">
        <div className="mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl text-text-heading mb-3">
            Learn Effect TS
          </h2>
          <p className="text-[13px] text-text-body leading-relaxed max-w-lg">
            A structured {TOTAL_STEPS}-step learning path from zero to productive.
            Each phase builds on the last — start with Foundation and work your
            way through.
          </p>
          <div className="flex gap-4 mt-4 text-[11px] text-text-muted">
            <span>{TOTAL_STEPS} steps</span>
            <span>{PHASES.length} phases</span>
            <span>~{TOTAL_HOURS} hours</span>
          </div>
        </div>

        <div className="space-y-3">
          {PHASES.map((phase, i) => (
            <PhaseCard key={phase.slug} phase={phase} index={i} />
          ))}
        </div>
      </main>
    </ProgressProvider>
  );
}
