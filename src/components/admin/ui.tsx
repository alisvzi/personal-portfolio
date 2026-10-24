"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { localeLabels, type Locale } from "@/i18n/config";

/**
 * Shared admin chrome.
 *
 * The dashboard panels each used to invent their own heading, error banner and
 * empty state, which is why they drifted apart: one had a 2xl heading, the next
 * a 3xl one, and the error banner was copy-pasted six times. These primitives
 * are the single definition of each, so a change lands everywhere at once.
 */

interface SectionHeaderProps {
  title: string;
  /** One line under the title explaining what the tab controls. */
  description?: string;
  /** Right-aligned controls, usually the primary "add" button. */
  children?: React.ReactNode;
}

export function SectionHeader({
  title,
  description,
  children,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold text-text sm:text-2xl">{title}</h2>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-text-muted">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex shrink-0 gap-2">{children}</div>}
    </div>
  );
}

interface AlertProps {
  children: React.ReactNode;
  tone?: "error" | "success" | "info";
}

export function Alert({ children, tone = "error" }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-lg border p-3 text-sm leading-relaxed",
        tone === "error" &&
          "border-red-500/35 bg-red-500/10 text-red-200",
        tone === "success" &&
          "border-accent-line bg-accent-soft text-accent-strong",
        tone === "info" && "border-border-soft bg-surface/60 text-text-muted",
      )}
    >
      {children}
    </div>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
}

export function EmptyState({ icon: Icon, title, hint }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong/70 bg-surface/20 px-6 py-16 text-center">
      <span className="grid size-11 place-items-center rounded-full border border-border-soft bg-surface/70 text-text-faint">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-text">{title}</p>
      {hint && <p className="max-w-sm text-xs text-text-faint">{hint}</p>}
    </div>
  );
}

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

/** Bordered surface used for every list row and form in the dashboard. */
export function Panel({ children, className }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-soft bg-surface/45 p-5 backdrop-blur-sm transition-colors duration-150",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface FieldProps {
  /** Must match the control's `id` so the label points at it. */
  htmlFor: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  htmlFor,
  label,
  hint,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-text-muted"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-text-faint">{hint}</p>}
    </div>
  );
}

interface LanguageTabsProps {
  value: Locale;
  onChange: (locale: Locale) => void;
  /** Marks the language currently being edited, e.g. "Content language". */
  label: string;
}

/**
 * Language switch inside an editor.
 *
 * Deliberately separate from the dashboard's own language switcher: that one
 * changes the interface language, this one chooses which translation of the
 * record is being typed. Conflating them would make the panel jump language
 * whenever the owner edited the other locale.
 */
export function LanguageTabs({ value, onChange, label }: LanguageTabsProps) {
  const options: Locale[] = ["en", "fa"];

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-lg border border-border-soft bg-bg-elevated/60 p-1"
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          lang={option}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong/40",
            value === option
              ? "bg-accent-soft text-accent-strong"
              : "text-text-muted hover:text-text",
          )}
        >
          {localeLabels[option]}
        </button>
      ))}
    </div>
  );
}
