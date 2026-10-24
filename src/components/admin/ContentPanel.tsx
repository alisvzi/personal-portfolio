"use client";

import { Edit } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

import { updateContent } from "@/app/actions/content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { localeLabels } from "@/i18n/config";
import { formatActionError } from "@/i18n/format";
import type { AdminLabels } from "./types";
import { Alert, Field, Panel, SectionHeader } from "./ui";

/**
 * Editable copy fields, in display order.
 *
 * `labelKey` points into the dictionary so the field names are translated,
 * `isFa` marks the Persian variants of the same underlying value, and
 * `multiline` picks the control explicitly. It used to be inferred from
 * `value.length > 100`, which silently swapped an input for a textarea the
 * moment a value crossed the threshold — surprising, and it made a short
 * paragraph impossible to edit in a single-line field.
 */
const CONTENT_FIELDS = [
  { key: "heroTitle", labelKey: "heroTitle", isFa: false, multiline: false },
  { key: "heroTitleFa", labelKey: "heroTitle", isFa: true, multiline: false },
  { key: "heroSubtitle", labelKey: "heroSubtitle", isFa: false, multiline: false },
  { key: "heroSubtitleFa", labelKey: "heroSubtitle", isFa: true, multiline: false },
  { key: "heroDescription", labelKey: "heroDescription", isFa: false, multiline: true },
  { key: "heroDescriptionFa", labelKey: "heroDescription", isFa: true, multiline: true },
  { key: "aboutText", labelKey: "aboutText", isFa: false, multiline: true },
  { key: "aboutTextFa", labelKey: "aboutText", isFa: true, multiline: true },
  { key: "contactEmail", labelKey: "contactEmail", isFa: false, multiline: false },
  { key: "contactPhone", labelKey: "contactPhone", isFa: false, multiline: false },
] as const;

interface ContentPanelProps {
  labels: AdminLabels;
}

/** Loads the editable copy fields. See ProjectsPanel for the pattern note. */
async function loadContent(): Promise<Record<string, string>> {
  const response = await fetch("/api/content");
  if (!response.ok) throw new Error("fetch failed");

  const data = (await response.json()) as Record<string, unknown>;
  const next: Record<string, string> = {};
  for (const field of CONTENT_FIELDS) {
    const value = data[field.key];
    next[field.key] = typeof value === "string" ? value : "";
  }
  return next;
}

export default function ContentPanel({ labels }: ContentPanelProps) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    try {
      setContent(await loadContent());
      setFormError("");
    } catch {
      setFormError(labels.errors.loadFailed);
    }
  }, [labels.errors.loadFailed]);

  useEffect(() => {
    let cancelled = false;

    loadContent()
      .then((next) => {
        if (cancelled) return;
        setContent(next);
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

  const handleUpdateContent = async (formData: FormData) => {
    setFormError("");

    startTransition(async () => {
      try {
        const result = await updateContent(formData);

        if (result.success) {
          setEditingKey(null);
          await refresh();
        } else {
          setFormError(formatActionError(labels.errors, result.error, result.values));
        }
      } catch {
        setFormError(labels.errors.unexpected);
      }
    });
  };

  if (isLoading) {
    return <p className="text-sm text-text-muted">{labels.content.loading}</p>;
  }

  return (
    <div className="space-y-6">
      <SectionHeader title={labels.content.heading} />

      {formError && <Alert>{formError}</Alert>}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {CONTENT_FIELDS.map((field) => {
          const value = content[field.key] ?? "";
          const isEditing = editingKey === field.key;
          const label =
            labels.content[field.labelKey as keyof typeof labels.content];
          const fullLabel = field.isFa
            ? `${label} ${labels.content.persianSuffix}`
            : label;

          // The open editor takes the full width: these are paragraphs, and
          // editing one inside a half-width card wastes the row beside it.
          if (isEditing) {
            return (
              <Panel
                key={field.key}
                className="border-accent-line/60 bg-surface/60 lg:col-span-2"
              >
                <form action={handleUpdateContent}>
                  <input type="hidden" name="key" value={field.key} />

                  <Field htmlFor={field.key} label={fullLabel}>
                    {field.multiline ? (
                      <Textarea
                        id={field.key}
                        name="value"
                        defaultValue={value}
                        rows={5}
                        dir={field.isFa ? "rtl" : undefined}
                      />
                    ) : (
                      <Input
                        id={field.key}
                        name="value"
                        defaultValue={value}
                        dir={field.isFa ? "rtl" : undefined}
                      />
                    )}
                  </Field>

                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingKey(null)}
                    >
                      {labels.actions.cancel}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPending}
                      aria-disabled={isPending}
                    >
                      {isPending ? labels.actions.saving : labels.actions.save}
                    </Button>
                  </div>
                </form>
              </Panel>
            );
          }

          return (
            <Panel key={field.key} className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-text-muted">
                  <span className="truncate">{fullLabel}</span>
                  {field.isFa && (
                    <Badge variant="secondary" lang="fa">
                      {localeLabels.fa}
                    </Badge>
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditingKey(field.key)}
                  aria-label={`${labels.actions.edit} — ${fullLabel}`}
                  className="shrink-0"
                >
                  <Edit aria-hidden="true" />
                </Button>
              </div>
              <p
                className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-text"
                dir={field.isFa ? "rtl" : undefined}
              >
                {value || "—"}
              </p>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
