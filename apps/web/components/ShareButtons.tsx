'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-text-tertiary text-sm font-medium">Share:</span>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-1.5 rounded-full border border-border text-text-secondary text-sm font-medium hover:border-primary hover:text-text-primary transition-colors"
      >
        X / Twitter
      </a>

      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encoded}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-1.5 rounded-full border border-border text-text-secondary text-sm font-medium hover:border-primary hover:text-text-primary transition-colors"
      >
        LinkedIn
      </a>

      <button
        onClick={copyLink}
        className="px-4 py-1.5 rounded-full border border-border text-text-secondary text-sm font-medium hover:border-primary hover:text-text-primary transition-colors"
      >
        {copied ? '✓ Copied' : 'Copy link'}
      </button>
    </div>
  );
}
