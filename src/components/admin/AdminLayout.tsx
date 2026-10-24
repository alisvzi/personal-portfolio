"use client";

import {
  Briefcase,
  ExternalLink,
  FileText,
  FolderKanban,
  LogOut,
  Mail,
  Settings2,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { logoutAdmin } from "@/app/actions/auth";
import { BrandMark } from "@/components/brand/BrandMark";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { directionOf, type Locale } from "@/i18n/config";
import { personName } from "@/lib/constants";
import { cn } from "@/lib/utils";
import AccountPanel from "./AccountPanel";
import ContentPanel from "./ContentPanel";
import ExperiencePanel from "./ExperiencePanel";
import MessagesPanel from "./MessagesPanel";
import ProjectsPanel from "./ProjectsPanel";
import SkillsPanel from "./SkillsPanel";
import type { AdminLabels } from "./types";

interface AdminLayoutProps {
  locale: Locale;
  /** Sign-in address, shown pre-filled in the account tab. */
  currentEmail: string;
  labels: AdminLabels;
}

/**
 * Sections in rail order, each with the icon that identifies it.
 *
 * Kept outside the component because the order is a design decision, not state:
 * it reads as a workflow — the things the site shows, then the copy behind
 * them, then the inbox, then the account.
 */
const SECTIONS = [
  { value: "projects", icon: FolderKanban },
  { value: "skills", icon: Wrench },
  { value: "experiences", icon: Briefcase },
  { value: "content", icon: FileText },
  { value: "messages", icon: Mail },
  { value: "account", icon: Settings2 },
] as const;

type SectionValue = (typeof SECTIONS)[number]["value"];

/**
 * Admin shell.
 *
 * A fixed navigation rail on the left (start side, so it flips in Persian) and
 * a scrolling content column — the layout every dashboard the owner is likely
 * to compare this against uses. The previous version stacked a six-item tab
 * strip under a bare heading, which left the page with no hierarchy: the
 * heading, the tabs and the panel content all read at the same weight.
 *
 * The dashboard is not localized content — it is an internal tool — but its
 * chrome follows the language the owner is browsing in, and every panel
 * receives the same `labels` object so error messages agree across tabs.
 */
export default function AdminLayout({
  locale,
  currentEmail,
  labels,
}: AdminLayoutProps) {
  const [section, setSection] = useState<SectionValue>("projects");

  return (
    <Tabs
      value={section}
      onValueChange={(value) => setSection(value as SectionValue)}
      orientation="vertical"
      // Radix stamps its own `dir` on the root and defaults it to "ltr" when no
      // DirectionProvider is present. Without this the whole shell — rail on
      // the wrong side, every row reversed — would render left-to-right on the
      // Persian dashboard while the page around it is RTL.
      dir={directionOf(locale)}
      className="min-h-dvh gap-0"
    >
      <div className="flex min-h-dvh flex-col lg:flex-row">
        <aside className="shrink-0 border-b border-border-soft bg-bg-elevated/40 backdrop-blur-sm lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:border-b-0 lg:border-e xl:w-72">
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 px-4 py-4 lg:px-5 lg:py-6">
              <BrandMark className="size-9 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text">
                  {personName(locale)}
                </p>
                <p className="truncate text-xs text-text-faint">{labels.title}</p>
              </div>
            </div>

            <TabsList className="flex w-full shrink-0 gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:items-stretch lg:overflow-visible lg:pb-0">
              {SECTIONS.map(({ value, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="w-auto shrink-0 justify-start gap-2.5 px-3 lg:w-full lg:flex-none"
                >
                  <Icon aria-hidden="true" />
                  <span className="truncate">{labels.tabs[value]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-auto hidden px-3 pb-4 pt-6 lg:block">
              <div className="rounded-xl border border-border-soft bg-surface/40 p-3">
                <p className="text-xs text-text-faint">{labels.account.email}</p>
                <p
                  className="mt-0.5 truncate text-sm text-text"
                  title={currentEmail}
                >
                  {currentEmail || "—"}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Link
                    href={`/${locale}`}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong/40"
                  >
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                    {labels.viewSite}
                  </Link>
                  <button
                    type="button"
                    onClick={() => logoutAdmin(locale)}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-red-300/90 transition-colors duration-150 hover:bg-red-500/10 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
                  >
                    <LogOut className="size-3.5" aria-hidden="true" />
                    {labels.logout}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border-soft bg-bg/85 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <p className="text-xs text-text-faint">{labels.title}</p>
                <h1 className="truncate text-lg font-semibold text-text">
                  {labels.tabs[section]}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <LanguageSwitcher
                  locale={locale}
                  labels={labels.language}
                  variant="inline"
                />
                <button
                  type="button"
                  onClick={() => logoutAdmin(locale)}
                  aria-label={labels.logout}
                  title={labels.logout}
                  className={cn(
                    "grid size-9 place-items-center rounded-full border border-border-soft bg-surface/70 text-text-muted transition-colors duration-150",
                    "hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40",
                    "lg:hidden",
                  )}
                >
                  <LogOut className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-6xl">
              <TabsContent value="projects">
                <ProjectsPanel labels={labels} />
              </TabsContent>

              <TabsContent value="skills">
                <SkillsPanel labels={labels} />
              </TabsContent>

              <TabsContent value="experiences">
                <ExperiencePanel labels={labels} />
              </TabsContent>

              <TabsContent value="content">
                <ContentPanel labels={labels} />
              </TabsContent>

              <TabsContent value="messages">
                <MessagesPanel locale={locale} labels={labels} />
              </TabsContent>

              <TabsContent value="account">
                <AccountPanel currentEmail={currentEmail} labels={labels} />
              </TabsContent>
            </div>
          </main>
        </div>
      </div>
    </Tabs>
  );
}
