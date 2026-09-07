import * as React from "react"
import Link from "next/link"

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
]

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        <div className="flex flex-col gap-6">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <span className="text-xl font-bold text-primary">NWS</span>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
              A production-ready Next.js 15 + headless WordPress monorepo starter.
              Open source, built with Docker, CI/CD, and shadcn/ui.
              Clone it and ship.
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Quick links">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {footerLinks.map((link, index) => (
                <React.Fragment key={link.href}>
                  <li>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                  {index < footerLinks.length - 1 && (
                    <li aria-hidden="true" className="text-text-tertiary text-xs">·</li>
                  )}
                </React.Fragment>
              ))}
            </ul>
          </nav>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Copyright */}
          <p className="text-xs text-text-tertiary">
            © 2026 nextjs-wordpress-starter |{" "}
            <a
              href="https://arashworks.ir"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Arash Abolhasani
            </a>
          </p>

        </div>
      </div>
    </footer>
  )
}
