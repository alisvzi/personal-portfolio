import { notFound } from "next/navigation";

import ChapterNav from "@/components/layout/ChapterNav";
import HorizontalScroller from "@/components/layout/HorizontalScroller";
import SideToolBars from "@/components/layout/SideToolBars";
import AmbientBackground from "@/components/visual/AmbientBackground";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

/**
 * Shell for the public portfolio.
 *
 * Kept in a route group so the admin dashboard and the sign-in page — which sit
 * at `/[locale]/admin` and `/[locale]/auth/login` — do not inherit the horizontal
 * chapter navigation or the generative background.
 */
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    // No opaque background here: the fixed AmbientBackground (z-index -10)
    // paints the page backdrop, so an opaque wrapper would hide it entirely.
    <div className="relative min-h-dvh text-text">
      <AmbientBackground />
      <SideToolBars />
      <HorizontalScroller locale={locale}>
        {children}
        <ChapterNav labels={dict.nav} />
      </HorizontalScroller>
    </div>
  );
}
