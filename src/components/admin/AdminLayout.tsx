"use client";

import { LogOut } from "lucide-react";

import { logoutAdmin } from "@/app/actions/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Locale } from "@/i18n/config";
import ContentPanel from "./ContentPanel";
import ExperiencePanel from "./ExperiencePanel";
import MessagesPanel from "./MessagesPanel";
import ProjectsPanel from "./ProjectsPanel";
import SkillsPanel from "./SkillsPanel";
import type { AdminLabels } from "./types";

interface AdminLayoutProps {
  locale: Locale;
  labels: AdminLabels;
}

/**
 * Admin shell.
 *
 * The dashboard itself is not localized content — it is an internal tool — but
 * its chrome follows the language the owner is browsing in, and every panel
 * receives the same `labels` object so error messages agree across tabs.
 */
export default function AdminLayout({ locale, labels }: AdminLayoutProps) {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text">{labels.title}</h1>
        <button
          type="button"
          onClick={() => logoutAdmin(locale)}
          className="flex items-center gap-1 text-red-400 transition-colors hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {labels.logout}
        </button>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="mb-8 grid grid-cols-5">
          <TabsTrigger value="projects">{labels.tabs.projects}</TabsTrigger>
          <TabsTrigger value="skills">{labels.tabs.skills}</TabsTrigger>
          <TabsTrigger value="experiences">{labels.tabs.experiences}</TabsTrigger>
          <TabsTrigger value="content">{labels.tabs.content}</TabsTrigger>
          <TabsTrigger value="messages">{labels.tabs.messages}</TabsTrigger>
        </TabsList>

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
      </Tabs>
    </div>
  );
}
