import * as React from "react"
import Link from "next/link"
import { Button } from "./button"

export interface HeroProps {
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
}

export function Hero({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
}: HeroProps) {
  return (
    <section className="bg-gradient-to-b from-background to-surface min-h-[360px] md:min-h-[480px]">
      <div className="max-w-5xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-8">

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight max-w-2xl">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-text-secondary leading-relaxed max-w-2xl">
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>

          {secondaryCtaLabel && secondaryCtaHref && (
            <Button asChild variant="secondary" size="lg">
              <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
            </Button>
          )}
        </div>

      </div>
    </section>
  )
}
