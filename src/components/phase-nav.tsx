import Link from "next/link";
import type { Phase } from "@/data/steps";

interface PhaseNavProps {
  prev: Phase | null;
  next: Phase | null;
}

export function PhaseNav({ prev, next }: PhaseNavProps) {
  return (
    <div className="flex justify-between items-center mx-3 sm:mx-4 mt-8 pt-6 border-t border-border">
      {prev ? (
        <Link
          href={`/phase/${prev.slug}`}
          className="text-[11px] text-text-muted no-underline font-mono hover:text-accent transition-colors"
        >
          &larr; {prev.phase}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/phase/${next.slug}`}
          className="text-[11px] text-text-muted no-underline font-mono hover:text-accent transition-colors"
        >
          {next.phase} &rarr;
        </Link>
      ) : (
        <Link
          href="/"
          className="text-[11px] text-accent no-underline font-mono hover:text-accent-dark transition-colors"
        >
          Back to overview &rarr;
        </Link>
      )}
    </div>
  );
}
