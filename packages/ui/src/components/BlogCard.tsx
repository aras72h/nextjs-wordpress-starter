import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "./badge"
import { cn } from "@starter/ui/lib/utils"

export interface BlogCardProps {
  title: string
  excerpt: string
  slug: string
  category: string
  date: string
  imageUrl?: string
  featured?: boolean
  className?: string
}

export function BlogCard({
  title,
  excerpt,
  slug,
  category,
  date,
  imageUrl,
  featured = false,
  className,
}: BlogCardProps) {
  return (
    <Link
      href={slug}
      className={cn(
        "group flex flex-col bg-surface border border-border rounded-xl overflow-hidden",
        "transition-all duration-200 ease-in-out",
        "hover:border-primary hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      {/* Featured image */}
      {imageUrl && (
        <div
          className={cn(
            "w-full overflow-hidden relative",
            featured ? "aspect-[21/9]" : "aspect-video"
          )}
        >
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 gap-3 p-5">
        {/* Metadata row */}
        <div className="flex items-center gap-2">
          <Badge variant="default">{category}</Badge>
          <span className="text-text-tertiary text-xs">•</span>
          <span className="text-text-tertiary text-xs">{date}</span>
        </div>

        {/* Title */}
        <h3
          className={cn(
            "font-bold text-text-primary leading-snug",
            featured ? "text-2xl line-clamp-2" : "text-xl line-clamp-2"
          )}
        >
          {title}
        </h3>

        {/* Excerpt */}
        <p
          className={cn(
            "text-text-secondary text-sm leading-relaxed flex-1",
            featured ? "line-clamp-3" : "line-clamp-2"
          )}
        >
          {excerpt}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-1 text-primary text-sm font-semibold mt-1">
          <span>Read more</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1 ">
            →
          </span>
        </div>
      </div>
    </Link>
  )
}
