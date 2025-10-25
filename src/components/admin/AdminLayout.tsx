"use client";

import { logoutAdmin } from "@/app/actions/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut } from "lucide-react";
import ContentPanel from "./ContentPanel";
import ExperiencePanel from "./ExperiencePanel";
import MessagesPanel from "./MessagesPanel";
import ProjectsPanel from "./ProjectsPanel";
import SkillsPanel from "./SkillsPanel";

export default function AdminLayout() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={logoutAdmin}
          className="flex gap-0.5 items-center text-red-600 hover:text-red-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </button>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experiences">Experiences</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <ProjectsPanel />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsPanel />
        </TabsContent>

        <TabsContent value="experiences">
          <ExperiencePanel />
        </TabsContent>

        <TabsContent value="content">
          <ContentPanel />
        </TabsContent>

        <TabsContent value="messages">
          <MessagesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
