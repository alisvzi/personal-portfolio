"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Save, Trash2 } from "lucide-react";
import {
  createProject,
  updateProject,
  deleteProject,
} from "@/app/actions/projects";

type Project = {
  id: string;
  title: string;
  titleFa?: string;
  description: string;
  descriptionFa?: string;
  imageUrl: string;
  projectUrl?: string;
  githubUrl?: string;
  technologies: string;
  featured: boolean;
  order: number;
};

export default function ProjectsPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    setFormError("");
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      const arr = Array.isArray(data?.projects) ? data.projects : [];
      setProjects(
        arr.map((p: any) => ({
          id: p._id || p.id,
          title: p.title || "",
          titleFa: p.titleFa || "",
          description: p.description || "",
          descriptionFa: p.descriptionFa || "",
          imageUrl: p.imageUrl || "",
          projectUrl: p.projectUrl || "",
          githubUrl: p.githubUrl || "",
          technologies: p.technologies || "",
          featured: !!p.featured,
          order: typeof p.order === "number" ? p.order : 0,
        }))
      );
    } catch (err: any) {
      setFormError(err.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setFormError("");
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        const formData = new FormData();
        formData.append("id", id);

        const result = await deleteProject(formData);
        if (result.success) {
          fetchProjects();
        } else {
          setFormError(result.error || "Failed to delete project");
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        setFormError("An unexpected error occurred");
      }
    }
  };

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Button
          onClick={() =>
            setEditingProject({
              id: "",
              title: "",
              description: "",
              imageUrl: "",
              technologies: "",
              featured: false,
              order: 0,
            } as Project)
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      {formError && (
        <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm">
          {formError}
        </div>
      )}

      {editingProject && (
        <ProjectForm
          project={editingProject}
          onCancel={handleCancelEdit}
          onSuccess={() => {
            setEditingProject(null);
            fetchProjects();
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
          />
        ))}
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{project.title}</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(project)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(project.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {project.featured && <Badge>Featured</Badge>}
            <span className="text-sm text-gray-500">
              Order: {project.order}
            </span>
          </div>
          <p className="text-sm line-clamp-2">{project.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {project.technologies.split(",").map((tech, index) => (
              <Badge key={index} variant="secondary">
                {tech.trim()}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProjectFormProps {
  project: Project;
  onCancel: () => void;
  onSuccess: () => void;
}

function ProjectForm({ project, onCancel, onSuccess }: ProjectFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setError("");

    startTransition(async () => {
      try {
        let result;
        if (project.id) {
          // Add project ID to formData for update
          formData.append("id", project.id);
          result = await updateProject(formData);
        } else {
          result = await createProject(formData);
        }

        if (result.success) {
          onSuccess();
        } else {
          setError(result.error || "Failed to save project");
        }
      } catch (error) {
        console.error("Error saving project:", error);
        setError("An unexpected error occurred");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.id ? "Edit Project" : "Add New Project"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-app-error-light text-app-error-text rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={project.title}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="titleFa">Title (Persian)</Label>
              <Input
                id="titleFa"
                name="titleFa"
                defaultValue={project.titleFa}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={project.description}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionFa">Description (Persian)</Label>
              <Textarea
                id="descriptionFa"
                name="descriptionFa"
                defaultValue={project.descriptionFa}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              defaultValue={project.imageUrl}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectUrl">Project URL</Label>
              <Input
                id="projectUrl"
                name="projectUrl"
                defaultValue={project.projectUrl}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                name="githubUrl"
                defaultValue={project.githubUrl}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="technologies">Technologies (comma separated)</Label>
            <Input
              id="technologies"
              name="technologies"
              defaultValue={project.technologies}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                name="featured"
                defaultChecked={project.featured}
              />
              <Label htmlFor="featured">Featured Project</Label>
              <input
                type="hidden"
                name="featured"
                value={project.featured ? "true" : "false"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                defaultValue={project.order.toString()}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              aria-disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Project"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}