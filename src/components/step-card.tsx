import type { Phase, Step } from "@/data/steps";
import { CodeBlock } from "./code-block";
import { StepActions } from "./step-actions";
import { TweetSection } from "./tweet-section";

interface StepCardProps {
  step: Step;
  phase: Phase;
}

export function StepCard({ step, phase }: StepCardProps) {
  return (
    <div
      id={`step-${step.id}`}
      className="mx-3 sm:mx-4 mb-2 border border-border bg-bg-card scroll-mt-24"
    >
      {/* Header */}
      <div className="p-3.5 sm:p-4 flex items-start gap-3">
        <span className="font-serif text-lg text-text-muted min-w-7 leading-none pt-0.5">
          {String(step.id).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-text-heading">
            {step.title}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            {step.subtitle}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {step.tweet && (
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              className="text-tweet opacity-60"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          )}
          <span className="text-[10px] text-text-muted">{step.duration}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-3.5 sm:px-4 pb-5 sm:pl-[56px]">
        <p className="text-[13px] leading-relaxed text-text-body mb-4">
          {step.content}
        </p>

        {/* Key Insight */}
        <div
          className="bg-bg-elevated mb-4 p-3 sm:p-4 text-xs leading-relaxed text-text"
          style={{ borderLeft: `3px solid ${phase.phaseColor}` }}
        >
          <span
            className="text-[9px] uppercase tracking-[2px] block mb-1.5 font-semibold"
            style={{ color: phase.phaseColor }}
          >
            Key Insight
          </span>
          {step.keyIdea}
        </div>

        {/* Concepts */}
        <div className="mb-4">
          <span className="text-[9px] uppercase tracking-[2px] text-text-muted block mb-2.5 font-semibold">
            What to learn
          </span>
          {step.concepts.map((c, i) => (
            <div
              key={i}
              className="mb-2.5 pb-2.5"
              style={{
                borderBottom:
                  i < step.concepts.length - 1
                    ? "1px solid var(--color-bg-elevated)"
                    : "none",
              }}
            >
              <code className="text-xs text-accent bg-bg-elevated px-1.5 py-0.5 inline-block mb-1">
                {c.name}
              </code>
              <div className="text-[11px] text-text-subtle leading-relaxed">
                {c.desc}
              </div>
            </div>
          ))}
        </div>

        {/* TypeScript equivalent */}
        {step.tsCode && (
          <div className="mb-4">
            <span className="text-[9px] uppercase tracking-[2px] text-text-muted block mb-2 font-semibold">
              In TypeScript
            </span>
            <CodeBlock code={step.tsCode} />
          </div>
        )}

        {/* Code example */}
        {step.code && (
          <div className="mb-4">
            <span className="text-[9px] uppercase tracking-[2px] text-text-muted block mb-2 font-semibold">
              {step.tsCode ? "With Effect" : "Example"}
            </span>
            <CodeBlock code={step.code} />
          </div>
        )}

        {/* Diagram */}
        {step.diagram && (
          <div className="mb-4">
            <span
              className="text-[9px] uppercase tracking-[2px] text-text-muted block mb-2 font-semibold"
            >
              How it works
            </span>
            <pre
              className="bg-bg-elevated border border-border p-4 text-[11px] leading-relaxed text-text overflow-x-auto"
              style={{ borderLeft: `3px solid ${phase.phaseColor}` }}
            >{step.diagram}</pre>
          </div>
        )}

        {/* Practice exercises */}
        {step.practice && step.practice.length > 0 && (
          <div className="mb-4">
            <span className="text-[9px] uppercase tracking-[2px] text-text-muted block mb-2.5 font-semibold">
              Practice
            </span>
            {step.practice.map((p, i) => (
              <div
                key={i}
                className="mb-3 border border-border bg-bg-elevated"
              >
                <div className="p-3 sm:p-4">
                  <div className="text-xs font-medium text-text-heading mb-1">
                    {p.title}
                  </div>
                  <p className="text-[11px] text-text-subtle leading-relaxed mb-3">
                    {p.prompt}
                  </p>
                  <CodeBlock code={p.startCode} />
                </div>
                <details className="group">
                  <summary className="px-3 sm:px-4 py-2 text-[10px] uppercase tracking-[1.5px] font-semibold cursor-pointer select-none"
                    style={{ color: phase.phaseColor }}
                  >
                    Reveal solution
                  </summary>
                  <div className="px-3 sm:px-4 pb-3">
                    <CodeBlock code={p.solution} />
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}

        {/* Common trap */}
        <div className="bg-trap-bg border border-trap-border p-3 sm:p-4 mb-4 text-[11px] leading-relaxed text-trap">
          <span className="text-[9px] uppercase tracking-[2px] block mb-1.5 font-semibold">
            Common Trap
          </span>
          {step.trap}
        </div>

        {/* Tweet */}
        {step.tweet && <TweetSection stepId={step.id} />}

        {/* Actions */}
        <StepActions step={step} />
      </div>
    </div>
  );
}
