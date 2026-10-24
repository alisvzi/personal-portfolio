"use client";

import { Briefcase, Edit, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

import {
  createExperience,
  deleteExperience,
  updateExperience,
} from "@/app/actions/experiences";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/i18n/config";
import { formatActionError, interpolate } from "@/i18n/format";
import { cn } from "@/lib/utils";
import type { AdminLabels } from "./types";
import { Alert, EmptyState, Field, LanguageTabs, Panel, SectionHeader } from "./ui";

type Experience = {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
  titleFa: string;
  companyFa: string;
  periodFa: string;
  descriptionFa: string;
  technologiesFa: string[];
  order: number;
};

interface ExperiencePanelProps {
  labels: AdminLabels;
}

const EMPTY_EXPERIENCE: Experience = {
  id: "",
  title: "",
  company: "",
  period: "",
  description: "",
  technologies: [],
  titleFa: "",
  companyFa: "",
  periodFa: "",
  descriptionFa: "",
  technologiesFa: [],
  order: 0,
};

function readList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

/** Loads and narrows the experience list. See ProjectsPanel for the pattern note. */
async function loadExperiences(): Promise<Experience[]> {
  const response = await fetch("/api/experiences");
  if (!response.ok) throw new Error("fetch failed");

  const data = (await response.json()) as { experiences?: unknown };
  const list = Array.isArray(data.experiences) ? data.experiences : [];

  return list.map((raw) => {
    const experience = raw as Record<string, unknown>;
    const text = (key: string) =>
      typeof experience[key] === "string" ? (experience[key] as string) : "";

    return {
      id: String(experience.id ?? ""),
      title: text("title"),
      company: text("company"),
      period: text("period"),
      description: text("description"),
      technologies: readList(experience.technologies),
      titleFa: text("titleFa"),
      companyFa: text("companyFa"),
      periodFa: text("periodFa"),
      descriptionFa: text("descriptionFa"),
      technologiesFa: readList(experience.technologiesFa),
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
    return <p className="text-sm text-text-muted">{labels.experiences.loading}</p>;
  }

  return (
    <div className="space-y-6">
      <SectionHeader title={labels.experiences.heading}>
        <Button onClick={() => setEditingExperience(EMPTY_EXPERIENCE)}>
          <Plus aria-hidden="true" />
          {labels.actions.add}
        </Button>
      </SectionHeader>

      {formError && <Alert>{formError}</Alert>}

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
        <EmptyState icon={Briefcase} title={labels.experiences.empty} />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {experiences.map((experience) => (
            <ExperienceRow
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

interface ExperienceRowProps {
  experience: Experience;
  labels: AdminLabels;
  onEdit: (experience: Experience) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function ExperienceRow({
  experience,
  labels,
  onEdit,
  onDelete,
  isDeleting,
}: ExperienceRowProps) {
  return (
    <Panel className="hover:border-border-strong">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-text">{experience.title}</h3>
          {experience.titleFa && (
            <p className="mt-0.5 truncate text-sm text-accent-strong" dir="rtl">
              {experience.titleFa}
            </p>
          )}
          <p className="mt-1.5 text-xs text-text-muted">
            {[experience.company, experience.period]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onEdit(experience)}
            aria-label={labels.actions.edit}
          >
            <Edit aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onDelete(experience.id)}
            disabled={isDeleting}
            aria-label={labels.actions.delete}
            className="hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-200"
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </div>

      <p
        className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-muted"
        // The row is laid out RTL; English copy inside it would otherwise have
        // its full stop jump to the wrong end.
        dir="auto"
      >
        {experience.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {experience.technologies.map((tech, index) => (
          <Badge key={`${tech}-${index}`} variant="secondary">
            {tech}
          </Badge>
        ))}
        <span className="ms-auto text-xs text-text-faint">
          {interpolate(labels.experiences.orderLabel, {
            order: experience.order,
          })}
        </span>
      </div>
    </Panel>
  );
}

interface ExperienceFormProps {
  experience: Experience;
  labels: AdminLabels;
  onCancel: () => void;
  onSuccess: () => void;
}

/**
 * Create/edit form.
 *
 * Both language blocks stay mounted and the inactive one is hidden with CSS
 * rather than unmounted: a hidden `display:none` field is still submitted, so
 * the owner can fill in the English copy, switch to Persian, fill that in, and
 * submit once — with nothing silently dropped.
 */
function ExperienceForm({
  experience,
  labels,
  onCancel,
  onSuccess,
}: ExperienceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<Locale>("en");

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
    <Panel className="border-accent-line/60 bg-surface/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-text">
          {experience.id
            ? labels.experiences.editTitle
            : labels.experiences.addTitle}
        </h3>
        <LanguageTabs
          value={language}
          onChange={setLanguage}
          label={labels.language.label}
        />
      </div>

      <form action={handleSubmit} className="mt-5 space-y-5">
        {error && <Alert>{error}</Alert>}

        <div
          className={cn("space-y-4", language !== "en" && "hidden")}
          dir="ltr"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field htmlFor="title" label={labels.experiences.title}>
              <Input
                id="title"
                name="title"
                defaultValue={experience.title}
                required
              />
            </Field>
            <Field htmlFor="company" label={labels.experiences.company}>
              <Input
                id="company"
                name="company"
                defaultValue={experience.company}
                required
              />
            </Field>
          </div>

          <Field htmlFor="period" label={labels.experiences.period}>
            <Input
              id="period"
              name="period"
              defaultValue={experience.period}
              placeholder="2023 — 2024"
              required
            />
          </Field>

          <Field
            htmlFor="description"
            label={labels.experiences.description}
          >
            <Textarea
              id="description"
              name="description"
              defaultValue={experience.description}
              rows={4}
              required
            />
          </Field>

          <Field
            htmlFor="technologies"
            label={labels.experiences.technologies}
          >
            <Input
              id="technologies"
              name="technologies"
              defaultValue={experience.technologies.join(", ")}
              placeholder="React, Next.js, TypeScript"
              required
            />
          </Field>
        </div>

        <div
          className={cn("space-y-4", language !== "fa" && "hidden")}
          dir="rtl"
        >
          <p className="rounded-lg border border-border-soft bg-bg-elevated/50 p-3 text-xs leading-relaxed text-text-muted">
            {labels.experiences.persianHint}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field htmlFor="titleFa" label={labels.experiences.titleFa}>
              <Input
                id="titleFa"
                name="titleFa"
                defaultValue={experience.titleFa}
              />
            </Field>
            <Field htmlFor="companyFa" label={labels.experiences.companyFa}>
              <Input
                id="companyFa"
                name="companyFa"
                defaultValue={experience.companyFa}
              />
            </Field>
          </div>

          <Field htmlFor="periodFa" label={labels.experiences.periodFa}>
            <Input
              id="periodFa"
              name="periodFa"
              defaultValue={experience.periodFa}
              placeholder="۱۴۰۲ — ۱۴۰۳"
            />
          </Field>

          <Field
            htmlFor="descriptionFa"
            label={labels.experiences.descriptionFa}
          >
            <Textarea
              id="descriptionFa"
              name="descriptionFa"
              defaultValue={experience.descriptionFa}
              rows={4}
            />
          </Field>

          <Field
            htmlFor="technologiesFa"
            label={labels.experiences.technologiesFa}
          >
            <Input
              id="technologiesFa"
              name="technologiesFa"
              defaultValue={experience.technologiesFa.join("، ")}
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border-soft pt-5">
          <Field
            htmlFor="order"
            label={labels.experiences.order}
            className="w-32"
          >
            <Input
              id="order"
              name="order"
              type="number"
              defaultValue={experience.order.toString()}
            />
          </Field>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              {labels.actions.cancel}
            </Button>
            <Button type="submit" disabled={isPending} aria-disabled={isPending}>
              {isPending ? labels.actions.saving : labels.experiences.saveLabel}
            </Button>
          </div>
        </div>
      </form>
    </Panel>
  );
}
