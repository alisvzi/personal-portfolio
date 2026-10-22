"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState, useTransition } from "react";

import {
  createProject,
  deleteProject,
  updateProject,
} from "@/app/actions/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatActionError, interpolate } from "@/i18n/format";
import { compressImage } from "@/lib/utils/image/compress";
import type { AdminLabels } from "./types";

interface GalleryImage {
  url: string;
  placeholder?: string;
}

type Project = {
  id: string;
  slug: string;
  title: string;
  titleFa?: string;
  description: string;
  descriptionFa?: string;
  longDescription?: string;
  longDescriptionFa?: string;
  role?: string;
  year?: string;
  client?: string;
  imageUrl: string;
  gallery: GalleryImage[];
  projectUrl?: string;
  githubUrl?: string;
  technologies: string;
  featured: boolean;
  order: number;
};

interface ProjectsPanelProps {
  labels: AdminLabels;
}

/**
 * Loads and narrows the project list.
 *
 * A module-level pure function so the effect can call it without the
 * `set-state-in-effect` pattern: the effect only subscribes to the promise's
 * result, which is what the rule asks for.
 */
async function loadProjects(): Promise<Project[]> {
  const response = await fetch("/api/projects");
  if (!response.ok) throw new Error("fetch failed");

  const data = (await response.json()) as { projects?: unknown };
  const list = Array.isArray(data.projects) ? data.projects : [];

  return list.map((raw) => {
    const project = raw as Record<string, unknown>;
    const gallery = Array.isArray(project.gallery)
      ? project.gallery.flatMap((entry) => {
          const item = entry as Record<string, unknown>;
          const url = typeof item.url === "string" ? item.url : "";
          return url ? [{ url, placeholder: String(item.placeholder ?? "") }] : [];
        })
      : [];

    return {
      id: String(project.id ?? project._id ?? ""),
      slug: String(project.slug ?? ""),
      title: String(project.title ?? ""),
      titleFa: String(project.titleFa ?? ""),
      description: String(project.description ?? ""),
      descriptionFa: String(project.descriptionFa ?? ""),
      longDescription: String(project.longDescription ?? ""),
      longDescriptionFa: String(project.longDescriptionFa ?? ""),
      role: String(project.role ?? ""),
      year: String(project.year ?? ""),
      client: String(project.client ?? ""),
      imageUrl: String(project.imageUrl ?? ""),
      gallery,
      projectUrl: String(project.projectUrl ?? ""),
      githubUrl: String(project.githubUrl ?? ""),
      technologies: String(project.technologies ?? ""),
      featured: Boolean(project.featured),
      order: typeof project.order === "number" ? project.order : 0,
    };
  });
}

/** A blank project, so the form can be reused for "add" and "edit". */
function emptyProject(): Project {
  return {
    id: "",
    slug: "",
    title: "",
    titleFa: "",
    description: "",
    descriptionFa: "",
    longDescription: "",
    longDescriptionFa: "",
    role: "",
    year: "",
    client: "",
    imageUrl: "",
    gallery: [],
    projectUrl: "",
    githubUrl: "",
    technologies: "",
    featured: false,
    order: 0,
  };
}

export default function ProjectsPanel({ labels }: ProjectsPanelProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setProjects(await loadProjects());
      setFormError("");
    } catch {
      setFormError(labels.errors.loadFailed);
    }
  }, [labels.errors.loadFailed]);

  useEffect(() => {
    let cancelled = false;

    loadProjects()
      .then((items) => {
        if (cancelled) return;
        setProjects(items);
        setFormError("");
      })
      .catch(() => {
        if (!cancelled) setFormError(labels.errors.loadFailed);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [labels.errors.loadFailed]);

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm(labels.confirm.deleteProject)) return;

    setDeletingId(id);
    try {
      const formData = new FormData();
      formData.append("id", id);

      const result = await deleteProject(formData);
      if (result.success) {
        await refresh();
      } else {
        setFormError(formatActionError(labels.errors, result.error, result.values));
      }
    } catch {
      // A thrown Server Action (network drop, 500) must surface, not vanish as
      // an unhandled rejection with the button stuck in its pending state.
      setFormError(labels.errors.unexpected);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <p className="text-text-muted">{labels.projects.loading}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">
          {labels.projects.heading}
        </h2>
        <Button onClick={() => setEditingProject(emptyProject())}>
          <Plus className="me-2 h-4 w-4" aria-hidden="true" />
          {labels.actions.add}
        </Button>
      </div>

      {formError && (
        <div
          role="alert"
          className="rounded-md border border-app-error/40 bg-app-error-light/10 p-3 text-sm text-app-error-text"
        >
          {formError}
        </div>
      )}

      {editingProject && (
        <ProjectForm
          project={editingProject}
          labels={labels}
          onCancel={() => {
            setEditingProject(null);
            setFormError("");
          }}
          onSuccess={() => {
            setEditingProject(null);
            refresh();
          }}
        />
      )}

      {projects.length === 0 && !editingProject && !formError ? (
        <p className="py-8 text-center text-sm text-text-muted">
          {labels.projects.empty}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              labels={labels}
              onEdit={setEditingProject}
              onDelete={handleDeleteProject}
              isDeleting={deletingId === project.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  labels: AdminLabels;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function ProjectCard({
  project,
  labels,
  onEdit,
  onDelete,
  isDeleting,
}: ProjectCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{project.title}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(project)}
              aria-label={labels.actions.edit}
            >
              <Edit className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(project.id)}
              disabled={isDeleting}
              aria-label={labels.actions.delete}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {project.featured && <Badge>{labels.projects.featuredBadge}</Badge>}
            <Badge variant="secondary">/{project.slug}</Badge>
            <span className="text-sm text-text-muted">
              {interpolate(labels.projects.orderLabel, { order: project.order })}
            </span>
          </div>
          <p className="line-clamp-2 text-sm">{project.description}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {project.technologies
              .split(",")
              .map((tech) => tech.trim())
              .filter(Boolean)
              .map((tech, i) => (
                <Badge key={`${tech}-${i}`} variant="secondary">
                  {tech}
                </Badge>
              ))}
          </div>
          {project.gallery.length > 0 && (
            <p className="text-xs text-text-muted">
              {labels.projects.galleryExisting}: {project.gallery.length}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ProjectFormProps {
  project: Project;
  labels: AdminLabels;
  onCancel: () => void;
  onSuccess: () => void;
}

function ProjectForm({ project, labels, onCancel, onSuccess }: ProjectFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [featured, setFeatured] = useState(project.featured);
  const [removedGallery, setRemovedGallery] = useState<string[]>([]);

  const toggleGalleryRemoval = (url: string, remove: boolean) => {
    setRemovedGallery((previous) =>
      remove ? [...new Set([...previous, url])] : previous.filter((item) => item !== url),
    );
  };

  const handleSubmit = async (formData: FormData) => {
    setError("");

    startTransition(async () => {
      try {
        if (project.id) formData.append("id", project.id);

        /*
         * Shrink the files in the browser before they are sent.
         *
         * `FormData` from a form submit holds the raw `File` objects, so they
         * are swapped here for re-encoded copies. Without this a handful of
         * phone screenshots would exceed Vercel's 4.5 MB request limit and the
         * save would fail with an opaque error.
         */
        const cover = formData.get("imageUrl");
        if (cover instanceof File && cover.size > 0) {
          formData.set("imageUrl", await compressImage(cover));
        }

        const galleryFiles = formData
          .getAll("gallery")
          .filter((value): value is File => value instanceof File && value.size > 0);

        if (galleryFiles.length > 0) {
          formData.delete("gallery");
          for (const galleryFile of galleryFiles) {
            formData.append("gallery", await compressImage(galleryFile));
          }
        }

        const result = project.id
          ? await updateProject(formData)
          : await createProject(formData);

        if (result.success) {
          onSuccess();
        } else {
          setError(formatActionError(labels.errors, result.error, result.values));
        }
      } catch {
        setError(labels.errors.unexpected);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {project.id ? labels.projects.editTitle : labels.projects.addTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-md border border-app-error/40 bg-app-error-light/10 p-3 text-sm text-app-error-text"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">{labels.projects.title}</Label>
              <Input
                id="title"
                name="title"
                defaultValue={project.title}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="titleFa">{labels.projects.titleFa}</Label>
              <Input
                id="titleFa"
                name="titleFa"
                defaultValue={project.titleFa}
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">{labels.projects.slug}</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={project.slug}
              dir="ltr"
              placeholder="my-project"
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
            />
            <p className="text-xs text-text-muted">{labels.projects.slugHint}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="description">{labels.projects.description}</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={project.description}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionFa">
                {labels.projects.descriptionFa}
              </Label>
              <Textarea
                id="descriptionFa"
                name="descriptionFa"
                defaultValue={project.descriptionFa}
                dir="rtl"
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="longDescription">
                {labels.projects.longDescription}
              </Label>
              <Textarea
                id="longDescription"
                name="longDescription"
                defaultValue={project.longDescription}
                rows={7}
              />
              <p className="text-xs text-text-muted">
                {labels.projects.longDescriptionHint}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescriptionFa">
                {labels.projects.longDescriptionFa}
              </Label>
              <Textarea
                id="longDescriptionFa"
                name="longDescriptionFa"
                defaultValue={project.longDescriptionFa}
                dir="rtl"
                rows={7}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="role">{labels.projects.role}</Label>
              <Input id="role" name="role" defaultValue={project.role} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">{labels.projects.year}</Label>
              <Input
                id="year"
                name="year"
                defaultValue={project.year}
                dir="ltr"
                placeholder="2024"
                inputMode="numeric"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">{labels.projects.client}</Label>
              <Input id="client" name="client" defaultValue={project.client} />
            </div>
          </div>

          {/* Cover */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">{labels.projects.coverImage}</Label>
            {project.imageUrl && (
              <div className="relative h-24 w-40 overflow-hidden rounded-md border border-border-soft">
                <Image
                  src={project.imageUrl}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
            )}
            <Input
              type="file"
              id="imageUrl"
              name="imageUrl"
              accept="image/jpeg,image/png,image/webp,image/avif"
              required={!project.id}
            />
            <p className="text-xs text-text-muted">{labels.projects.imageHint}</p>
          </div>

          {/* Gallery */}
          <div className="space-y-3 rounded-md border border-border-soft p-4">
            <div className="space-y-2">
              <Label htmlFor="gallery">{labels.projects.gallery}</Label>
              <Input
                type="file"
                id="gallery"
                name="gallery"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
              />
              <p className="text-xs text-text-muted">{labels.projects.galleryHint}</p>
            </div>

            {project.gallery.length === 0 ? (
              <p className="text-xs text-text-muted">{labels.projects.galleryEmpty}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">{labels.projects.galleryExisting}</p>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {project.gallery.map((image) => {
                    const removed = removedGallery.includes(image.url);
                    return (
                      <li
                        key={image.url}
                        className="space-y-1.5 rounded-md border border-border-soft p-2"
                      >
                        <div
                          className={`relative h-20 overflow-hidden rounded ${
                            removed ? "opacity-40" : ""
                          }`}
                        >
                          <Image
                            src={image.url}
                            alt=""
                            fill
                            sizes="120px"
                            className="object-cover"
                          />
                        </div>
                        <label className="flex items-center gap-2 text-xs text-text-muted">
                          <input
                            type="checkbox"
                            name="galleryRemove"
                            value={image.url}
                            checked={removed}
                            onChange={(event) =>
                              toggleGalleryRemoval(image.url, event.target.checked)
                            }
                          />
                          {labels.projects.galleryRemove}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="projectUrl">{labels.projects.projectUrl}</Label>
              <Input
                id="projectUrl"
                name="projectUrl"
                defaultValue={project.projectUrl}
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubUrl">{labels.projects.githubUrl}</Label>
              <Input
                id="githubUrl"
                name="githubUrl"
                defaultValue={project.githubUrl}
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="technologies">{labels.projects.technologies}</Label>
            <Input
              id="technologies"
              name="technologies"
              defaultValue={project.technologies}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              {/*
                The switch renders a `button`, which is not a labelable element,
                so `htmlFor` could never associate with it. The accessible name
                is carried by `aria-label` on the control instead.
              */}
              <Switch
                id="featured"
                checked={featured}
                onCheckedChange={setFeatured}
                aria-label={labels.projects.featured}
              />
              <Label>{labels.projects.featured}</Label>
              <input type="hidden" name="featured" value={featured ? "on" : ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">{labels.projects.order}</Label>
              <Input
                id="order"
                name="order"
                type="number"
                defaultValue={project.order.toString()}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              {labels.actions.cancel}
            </Button>
            <Button type="submit" disabled={isPending} aria-disabled={isPending}>
              {isPending ? labels.actions.saving : labels.projects.saveLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
