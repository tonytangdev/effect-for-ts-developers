import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PHASES, getPhaseBySlug } from "@/data/steps";
import { StepCard } from "@/components/step-card";
import { PhaseNav } from "@/components/phase-nav";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return PHASES.map((phase) => ({ slug: phase.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const phase = getPhaseBySlug(slug);
  if (!phase) return {};

  return {
    title: phase.phase,
    description: `Learn ${phase.phase} concepts in Effect TS: ${phase.steps.map((s) => s.title).join(", ")}`,
  };
}

export default async function PhasePage({ params }: Props) {
  const { slug } = await params;
  const phase = getPhaseBySlug(slug);

  if (!phase) notFound();

  const phaseIndex = PHASES.findIndex((p) => p.slug === slug);
  const prevPhase = phaseIndex > 0 ? PHASES[phaseIndex - 1] : null;
  const nextPhase =
    phaseIndex < PHASES.length - 1 ? PHASES[phaseIndex + 1] : null;

  return (
    <div className="pb-20">
      {/* Phase header */}
      <div className="px-4 sm:px-6 pt-6 pb-2 sticky top-[85px] bg-bg z-10">
        <div className="flex items-center gap-2.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: phase.phaseColor }}
          />
          <h2
            className="text-[10px] uppercase tracking-[3px] m-0 font-semibold"
            style={{ color: phase.phaseColor }}
          >
            {phase.phase}
          </h2>
          <span className="text-[10px] text-text-muted ml-auto">
            {phase.steps.length} step{phase.steps.length !== 1 && "s"}
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="mt-2">
        {phase.steps.map((step) => (
          <StepCard key={step.id} step={step} phase={phase} />
        ))}
      </div>

      {/* Phase navigation */}
      <PhaseNav prev={prevPhase} next={nextPhase} />
    </div>
  );
}
