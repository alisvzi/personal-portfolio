"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

import {
  createExperience,
  deleteExperience,
  updateExperience,
} from "@/app/actions/experiences";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatActionError, interpolate } from "@/i18n/format";
import type { AdminLabels } from "./types";

type Experience = {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
  order: number;
};

interface ExperiencePanelProps {
  labels: AdminLabels;
}

/** Loads and narrows the experience list. See ProjectsPanel for the pattern note. */
async function loadExperiences(): Promise<Experience[]> {
  const response = await fetch("/api/experiences");
  if (!response.ok) throw new Error("fetch failed");

  const data = (await response.json()) as { experiences?: unknown };
  const list = Array.isArray(data.experiences) ? data.experiences : [];

  return list.map((raw) => {
    const experience = raw as Record<string, unknown>;
    const technologies = Array.isArray(experience.technologies)
      ? (experience.technologies as string[])
      : typeof experience.technologies === "string"
        ? experience.technologies
            .split(",")
            .map((tech) => tech.trim())
            .filter(Boolean)
        : [];

    return {
      id: String(experience.id ?? experience._id ?? ""),
      title: String(experience.title ?? ""),
      company: String(experience.company ?? ""),
      period: String(experience.period ?? ""),
      description: String(experience.description ?? ""),
      technologies,
      order: typeof experience.order === "number" ? experience.order : 0,
    };
  });
}

export default function ExperiencePanel({ labels }: ExperiencePanelProps) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(
    null,
  );
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setExperiences(await loadExperiences());
      setFormError("");
    } catch {
      setFormError(labels.errors.loadFailed);
    }
  }, [labels.errors.loadFailed]);

  useEffect(() => {
    let cancelled = false;

    loadExperiences()
      .then((items) => {
        if (cancelled) return;
        setExperiences(items);
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

  const handleDeleteExperience = async (id: string) => {
    if (!window.confirm(labels.confirm.deleteExperience)) return;

    setDeletingId(id);
    try {
      const formData = new FormData();
      formData.append("id", id);

      const result = await deleteExperience(formData);
      if (result.success) {
        await refresh();
      } else {
        setFormError(formatActionError(labels.errors, result.error, result.values));
      }
    } catch {
      setFormError(labels.errors.unexpected);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <p className="text-text-muted">{labels.experiences.loading}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">
          {labels.experiences.heading}
        </h2>
        <Button
          onClick={() =>
            setEditingExperience({
              id: "",
              title: "",
              company: "",
              period: "",
              description: "",
              technologies: [],
              order: 0,
            })
          }
        >
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

      {editingExperience && (
        <ExperienceForm
          experience={editingExperience}
          labels={labels}
          onCancel={() => {
            setEditingExperience(null);
            setFormError("");
          }}
          onSuccess={() => {
            setEditingExperience(null);
            refresh();
          }}
        />
      )}

      {experiences.length === 0 && !editingExperience && !formError ? (
        <p className="py-8 text-center text-sm text-text-muted">
          {labels.experiences.empty}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {experiences.map((experience) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              labels={labels}
              onEdit={setEditingExperience}
              onDelete={handleDeleteExperience}
              isDeleting={deletingId === experience.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ExperienceCardProps {
  experience: Experience;
  labels: AdminLabels;
  onEdit: (experience: Experience) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function ExperienceCard({
  experience,
  labels,
  onEdit,
  onDelete,
  isDeleting,
}: ExperienceCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{experience.title}</CardTitle>
            <div className="text-sm text-text-muted">
              {experience.company} | {experience.period}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(experience)}
              aria-label={labels.actions.edit}
            >
              <Edit className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(experience.id)}
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
          <p className="line-clamp-2 text-sm">{experience.description}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {experience.technologies.map((tech, i) => (
              <Badge key={`${tech}-${i}`} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
          <div className="mt-2 text-xs text-text-muted">
            {interpolate(labels.experiences.orderLabel, {
              order: experience.order,
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ExperienceFormProps {
  experience: Experience;
  labels: AdminLabels;
  onCancel: () => void;
  onSuccess: () => void;
}

function ExperienceForm({
  experience,
  labels,
  onCancel,
  onSuccess,
}: ExperienceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setError("");
    if (experience.id) formData.append("id", experience.id);

    startTransition(async () => {
      try {
        const result = experience.id
          ? await updateExperience(formData)
          : await createExperience(formData);

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
          {experience.id
            ? labels.experiences.editTitle
            : labels.experiences.addTitle}
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
              <Label htmlFor="title">{labels.experiences.title}</Label>
              <Input
                id="title"
                name="title"
                defaultValue={experience.title}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">{labels.experiences.company}</Label>
              <Input
                id="company"
                name="company"
                defaultValue={experience.company}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="period">{labels.experiences.period}</Label>
              <Input
                id="period"
                name="period"
                defaultValue={experience.period}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">{labels.experiences.order}</Label>
              <Input
                id="order"
                name="order"
                type="number"
                defaultValue={experience.order.toString()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{labels.experiences.description}</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={experience.description}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technologies">
              {labels.experiences.technologies}
            </Label>
            <Input
              id="technologies"
              name="technologies"
              defaultValue={experience.technologies.join(", ")}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              {labels.actions.cancel}
            </Button>
            <Button type="submit" disabled={isPending} aria-disabled={isPending}>
              {isPending ? labels.actions.saving : labels.experiences.saveLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
