"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

import { createSkill, deleteSkill, updateSkill } from "@/app/actions/skills";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatActionError, interpolate } from "@/i18n/format";
import type { AdminLabels } from "./types";

type Skill = {
  id: string;
  name: string;
  nameFa?: string;
  category: string;
  level: number;
  icon: string;
  order: number;
};

interface SkillsPanelProps {
  labels: AdminLabels;
}

/** Loads and narrows the skill list. See ProjectsPanel for the pattern note. */
async function loadSkills(): Promise<Skill[]> {
  const response = await fetch("/api/skills");
  if (!response.ok) throw new Error("fetch failed");

  const data = (await response.json()) as { skills?: unknown };
  const list = Array.isArray(data.skills) ? data.skills : [];

  return list.map((raw) => {
    const skill = raw as Record<string, unknown>;
    return {
      id: String(skill.id ?? skill._id ?? ""),
      name: String(skill.name ?? ""),
      nameFa: String(skill.nameFa ?? ""),
      category: String(skill.category ?? ""),
      level: typeof skill.level === "number" ? skill.level : 50,
      icon: String(skill.icon ?? ""),
      order: typeof skill.order === "number" ? skill.order : 0,
    };
  });
}

export default function SkillsPanel({ labels }: SkillsPanelProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setSkills(await loadSkills());
      setFormError("");
    } catch {
      setFormError(labels.errors.loadFailed);
    }
  }, [labels.errors.loadFailed]);

  useEffect(() => {
    let cancelled = false;

    loadSkills()
      .then((items) => {
        if (cancelled) return;
        setSkills(items);
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

  const handleDeleteSkill = async (id: string) => {
    if (!window.confirm(labels.confirm.deleteSkill)) return;

    setDeletingId(id);
    try {
      const formData = new FormData();
      formData.append("id", id);

      const result = await deleteSkill(formData);
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
    return <p className="text-text-muted">{labels.skills.loading}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">
          {labels.skills.heading}
        </h2>
        <Button
          onClick={() =>
            setEditingSkill({
              id: "",
              name: "",
              category: "",
              level: 50,
              icon: "",
              order: 0,
            })
          }
        >
          <Plus className="me-2 h-4 w-4" aria-hidden="true" />
          {labels.actions.add}
        </Button>
      </div>

      {/*
        Makes the link between this tab and the public card explicit. The
        "Tools I work with" card on the home page is not separate content — it
        is a live render of this exact collection, so a skill added here appears
        there on the next request with no extra step.
      */}
      <p className="rounded-md border border-accent/25 bg-accent-soft/40 p-3 text-sm leading-relaxed text-text-muted">
        {labels.skills.toolboxHint}
      </p>

      {formError && (
        <div
          role="alert"
          className="rounded-md border border-app-error/40 bg-app-error-light/10 p-3 text-sm text-app-error-text"
        >
          {formError}
        </div>
      )}

      {editingSkill && (
        <SkillForm
          skill={editingSkill}
          labels={labels}
          onCancel={() => {
            setEditingSkill(null);
            setFormError("");
          }}
          onSuccess={() => {
            setEditingSkill(null);
            refresh();
          }}
        />
      )}

      {skills.length === 0 && !editingSkill && !formError ? (
        <p className="py-8 text-center text-sm text-text-muted">
          {labels.skills.empty}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              labels={labels}
              onEdit={setEditingSkill}
              onDelete={handleDeleteSkill}
              isDeleting={deletingId === skill.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SkillCardProps {
  skill: Skill;
  labels: AdminLabels;
  onEdit: (skill: Skill) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function SkillCard({ skill, labels, onEdit, onDelete, isDeleting }: SkillCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{skill.name}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(skill)}
              aria-label={labels.actions.edit}
            >
              <Edit className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(skill.id)}
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
          {skill.category && <Badge>{skill.category}</Badge>}
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-full rounded-full bg-surface-2">
              <div
                className="h-2.5 rounded-full bg-accent"
                style={{ width: `${skill.level}%` }}
              />
            </div>
            <span className="text-sm">{skill.level}%</span>
          </div>
          <div className="flex justify-between text-sm text-text-muted">
            <span>
              {labels.skills.icon}: {skill.icon}
            </span>
            <span>
              {interpolate(labels.skills.orderLabel, { order: skill.order })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SkillFormProps {
  skill: Skill;
  labels: AdminLabels;
  onCancel: () => void;
  onSuccess: () => void;
}

function SkillForm({ skill, labels, onCancel, onSuccess }: SkillFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [level, setLevel] = useState(skill.level);

  const categories = [
    "Frontend",
    "Backend",
    "Database",
    "DevOps",
    "Mobile",
    "Design",
    "Other",
  ];

  const handleSubmit = async (formData: FormData) => {
    setError("");
    formData.set("level", level.toString());
    if (skill.id) formData.append("id", skill.id);

    startTransition(async () => {
      try {
        const result = skill.id
          ? await updateSkill(formData)
          : await createSkill(formData);

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
          {skill.id ? labels.skills.editTitle : labels.skills.addTitle}
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
              <Label htmlFor="name">{labels.skills.name}</Label>
              <Input id="name" name="name" defaultValue={skill.name} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameFa">{labels.skills.nameFa}</Label>
              <Input
                id="nameFa"
                name="nameFa"
                defaultValue={skill.nameFa}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              {/*
                A Radix `SelectTrigger` renders a `button`, so a `<label for>`
                cannot associate with it — the accessible name is set on the
                trigger itself.
              */}
              <Label>{labels.skills.category}</Label>
              <Select name="category" defaultValue={skill.category}>
                <SelectTrigger aria-label={labels.skills.category}>
                  <SelectValue placeholder={labels.skills.selectCategory} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">{labels.skills.icon}</Label>
              <Input id="icon" name="icon" defaultValue={skill.icon} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">
              {interpolate(labels.skills.levelLabel, { level })}
            </Label>
            <Input
              id="level"
              type="range"
              min="0"
              max="100"
              value={level}
              onChange={(event) => setLevel(Number.parseInt(event.target.value, 10))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">{labels.skills.order}</Label>
            <Input
              id="order"
              name="order"
              type="number"
              defaultValue={skill.order.toString()}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              {labels.actions.cancel}
            </Button>
            <Button type="submit" disabled={isPending} aria-disabled={isPending}>
              {isPending ? labels.actions.saving : labels.skills.saveLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
