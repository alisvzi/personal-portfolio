import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AdminLayout from "@/components/admin/AdminLayout";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

/**
 * Admin dashboard.
 *
 * `proxy.ts` redirects unauthenticated visitors to the sign-in page, but that
 * is a convenience gate only: every Server Action and Route Handler the panels
 * call re-checks the session itself, so this page renders no data of its own.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    title: getDictionary(locale).meta.adminTitle,
    robots: { index: false, follow: false },
  };
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <AdminLayout
      locale={locale}
      labels={{
        title: dict.admin.title,
        logout: dict.admin.logout,
        tabs: dict.admin.tabs,
        actions: dict.admin.actions,
        errors: dict.admin.errors,
        confirm: dict.admin.confirm,
        projects: dict.admin.projects,
        skills: dict.admin.skills,
        experiences: dict.admin.experiences,
        content: dict.admin.content,
        messages: dict.admin.messages,
      }}
    />
  );
}
