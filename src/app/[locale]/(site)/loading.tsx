import StatusScreen from "@/components/layout/StatusScreen";

/**
 * Loading boundary for every page under the locale layout.
 *
 * Rendered by Next.js while a Server Component is streaming, so it cannot
 * receive the locale as a prop; `StatusScreen` reads it from the pathname.
 */
export default function Loading() {
  return <StatusScreen variant="loading" />;
}
