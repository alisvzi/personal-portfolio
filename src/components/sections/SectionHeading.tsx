import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  index: string;
  title: string;
  className?: string;
}

/**
 * Chapter header: a mono index with a short accent rule, then the title.
 * Purely presentational — safe as a Server Component, no client JS.
 */
export function SectionHeading({ index, title, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm tracking-[var(--ls-index)] text-accent">
          {index}
        </span>
        <span className="h-px w-12 bg-gradient-to-r from-accent to-transparent" />
      </div>
      <h2
        className="text-safe font-semibold tracking-[var(--ls-heading)] text-text"
        style={{ fontSize: "var(--fs-3)", lineHeight: "var(--lh-heading)" }}
      >
        {title}
      </h2>
    </div>
  );
}

export default SectionHeading;
