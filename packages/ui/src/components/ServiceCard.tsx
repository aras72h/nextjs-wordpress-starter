import * as React from "react"
import Link from "next/link"
import { Badge } from "./badge"
import { Button } from "./button"
import { cn } from "@starter/ui/lib/utils"

export interface ServiceCardProps {
  category: "audio" | "video"
  categoryLabel: string
  title: string
  description: string
  includes: string[]
  ctaLabel?: string
  ctaHref: string
  className?: string
}

export function ServiceCard({
  category,
  categoryLabel,
  title,
  description,
  includes,
  ctaLabel = "اطلاعات بیشتر",
  ctaHref,
  className,
}: ServiceCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col bg-surface border border-border rounded-xl overflow-hidden",
        "transition-all duration-200 ease-in-out hover:shadow-lg",
        className
      )}
    >
      {/* Top gradient border — visible on hover only */}
      <div
        className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-l from-primary to-primary-light opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="flex flex-col flex-1 gap-4 p-6">

        {/* Category badge */}
        <div>
          <Badge variant={category === "audio" ? "default" : "secondary"}>
            {categoryLabel}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-text-primary">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-text-secondary leading-relaxed">
          {description}
        </p>

        {/* Includes list */}
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-xs font-semibold text-text-tertiary">شامل می‌شود:</span>
          <ul className="flex flex-col gap-1.5">
            {includes.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="text-success font-bold shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="pt-2">
          <Button asChild variant="ghost" className="px-0 text-primary hover:text-primary hover:bg-transparent">
            <Link href={ctaHref} className="flex items-center gap-1">
              <span>{ctaLabel}</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                ←
              </span>
            </Link>
          </Button>
        </div>

      </div>
    </div>
  )
}
