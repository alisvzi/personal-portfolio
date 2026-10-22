import LoadingAnnouncement from "@/components/ui/LoadingAnnouncement";
import AmbientBackground from "@/components/visual/AmbientBackground";

/**
 * Loading skeleton for a project detail page.
 *
 * This is the boundary Next.js shows while the server renders
 * `work/[slug]` — a route that reads MongoDB on every request. Without it the
 * visitor would sit on the previous page with no acknowledgement of the click.
 *
 * It mirrors the real page's geometry (header bar, breadcrumb, title, cover,
 * article + facts column) so the transition is a fill-in rather than a layout
 * jump. Purely decorative: `aria-busy` is announced, the shapes are hidden from
 * assistive technology, and there is no client JavaScript.
 */
export default function ProjectLoading() {
  return (
    <div className="relative min-h-dvh text-text" aria-busy="true">
      <AmbientBackground />

      <LoadingAnnouncement />

      <header className="relative z-10 border-b border-border-soft/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <span className="h-9 w-28 animate-pulse rounded-full bg-surface" />
          <span aria-hidden="true" className="w-28 sm:w-32" />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2">
          <span className="h-3 w-14 animate-pulse rounded bg-surface" />
          <span className="h-3 w-2 animate-pulse rounded bg-surface" />
          <span className="h-3 w-16 animate-pulse rounded bg-surface" />
          <span className="h-3 w-2 animate-pulse rounded bg-surface" />
          <span className="h-3 w-24 animate-pulse rounded bg-surface" />
        </div>

        {/* Title block */}
        <span className="block h-3 w-24 animate-pulse rounded bg-surface" />
        <span className="mt-4 block h-12 w-3/4 animate-pulse rounded-lg bg-surface sm:h-16" />
        <div className="mt-5 space-y-3">
          <span className="block h-4 w-full max-w-2xl animate-pulse rounded bg-surface" />
          <span className="block h-4 w-2/3 max-w-xl animate-pulse rounded bg-surface" />
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <span className="h-10 w-36 animate-pulse rounded-full bg-surface" />
          <span className="h-10 w-32 animate-pulse rounded-full bg-surface" />
        </div>

        {/* Cover */}
        <div className="mt-10 aspect-[16/9] animate-pulse rounded-xl border border-border-strong bg-surface/70" />

        {/* Article + facts */}
        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-4 lg:col-span-8">
            <span className="block h-3 w-24 animate-pulse rounded bg-surface" />
            {[100, 96, 88, 94, 70].map((width, index) => (
              <span
                key={index}
                className="block h-4 animate-pulse rounded bg-surface"
                style={{ width: `${width}%` }}
              />
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="space-y-4 rounded-xl border border-border-soft bg-surface/50 p-6">
              <span className="block h-3 w-20 animate-pulse rounded bg-surface" />
              <span className="block h-4 w-full animate-pulse rounded bg-surface" />
              <span className="block h-4 w-5/6 animate-pulse rounded bg-surface" />
              <span className="block h-4 w-4/6 animate-pulse rounded bg-surface" />
              <div className="flex flex-wrap gap-2 pt-2">
                {[56, 72, 48].map((width, index) => (
                  <span
                    key={index}
                    className="h-6 animate-pulse rounded-full bg-surface"
                    style={{ width }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
