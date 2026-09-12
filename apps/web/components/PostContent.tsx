interface PostContentProps {
  html: string;
}

export function PostContent({ html }: PostContentProps) {
  return (
    <div
      className="prose prose-invert prose-lg max-w-none
        prose-headings:text-text-primary
        prose-p:text-text-secondary
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-text-primary
        prose-code:text-primary prose-code:bg-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-surface prose-pre:border prose-pre:border-border
        prose-blockquote:border-primary prose-blockquote:text-text-secondary
        prose-img:rounded-xl prose-img:border prose-img:border-border
        prose-hr:border-border"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
