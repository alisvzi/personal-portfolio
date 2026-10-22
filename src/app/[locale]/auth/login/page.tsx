import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LoginForm from "@/components/admin/LoginForm";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

/**
 * Admin sign-in page.
 *
 * The page itself is a Server Component so the dictionary never leaves the
 * server; the interactive form is a small Client Component that receives the
 * `login` slice as a prop.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    title: getDictionary(locale).meta.loginTitle,
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return <LoginForm locale={locale} labels={dict.login} />;
}
