import StatusScreen from "@/components/layout/StatusScreen";

/**
 * 404 screen for unknown paths under a valid locale.
 *
 * A path whose first segment is not a locale is redirected by `proxy.ts`
 * before it reaches this file, so this screen only ever renders inside a
 * language the site actually supports.
 */
export default function NotFound() {
  return <StatusScreen variant="notFound" />;
}
