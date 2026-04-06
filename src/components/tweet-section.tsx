"use client";

import { TWEET_TEMPLATES } from "@/data/steps";

interface TweetSectionProps {
  stepId: number;
}

export function TweetSection({ stepId }: TweetSectionProps) {
  const tweet = TWEET_TEMPLATES[stepId];
  if (!tweet) return null;

  return (
    <div className="bg-tweet-bg border border-tweet-border p-3.5 sm:p-4 mb-4">
      <div className="flex items-center gap-1.5 mb-2.5">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
          className="text-tweet"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span className="text-[9px] uppercase tracking-[2px] text-tweet font-semibold">
          Post what you learned
        </span>
      </div>
      <pre className="text-[11px] leading-relaxed text-tweet whitespace-pre-wrap break-words m-0 font-mono opacity-70">
        {tweet}
      </pre>
      <a
        href={`https://x.com/intent/tweet?text=${encodeURIComponent(tweet)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-1.5 bg-tweet text-white text-[11px] no-underline font-mono hover:opacity-90 transition-opacity"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Post on X
      </a>
    </div>
  );
}
