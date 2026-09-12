import Link from 'next/link';
import { cn } from '@starter/ui';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;         // e.g. '/blog'
  searchParams?: Record<string, string>; // preserved params like category
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams({ ...searchParams, page: String(page) });
    // Don't include page=1 in the URL — keep it clean
    if (page === 1) params.delete('page');
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-2 py-8"
    >
      {/* Previous */}
      {hasPrev ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="px-4 py-2 rounded-lg border border-border text-text-secondary text-sm font-medium hover:border-primary hover:text-text-primary transition-colors"
        >
          ← Previous
        </Link>
      ) : (
        <span className="px-4 py-2 rounded-lg border border-border text-text-tertiary text-sm font-medium cursor-not-allowed opacity-50">
          ← Previous
        </span>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={buildHref(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-primary text-white'
                : 'border border-border text-text-secondary hover:border-primary hover:text-text-primary'
            )}
          >
            {page}
          </Link>
        ))}
      </div>

      {/* Next */}
      {hasNext ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="px-4 py-2 rounded-lg border border-border text-text-secondary text-sm font-medium hover:border-primary hover:text-text-primary transition-colors"
        >
          Next →
        </Link>
      ) : (
        <span className="px-4 py-2 rounded-lg border border-border text-text-tertiary text-sm font-medium cursor-not-allowed opacity-50">
          Next →
        </span>
      )}
    </nav>
  );
}
