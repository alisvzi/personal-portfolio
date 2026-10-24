"use client";

import { KeyRound, Save } from "lucide-react";
import { useState, useTransition } from "react";

import { updateAdminCredentials } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatActionError, interpolate } from "@/i18n/format";
import type { AdminLabels } from "./types";
import { Alert, Field, Panel, SectionHeader } from "./ui";

/** Kept in step with the server action; the server is still the authority. */
const MIN_PASSWORD_LENGTH = 12;

interface AccountPanelProps {
  /** Current sign-in address, read on the server so the field starts filled. */
  currentEmail: string;
  labels: AdminLabels;
}

/**
 * Sign-in credentials, editable from the dashboard.
 *
 * The panel is deliberately its own section rather than a row inside "Content":
 * these two values are the keys to the dashboard, not site copy, and mixing
 * them in with the hero text is how a password ends up pasted into a public
 * field by mistake.
 *
 * Password fields start empty and are optional. Submitting with both blank
 * changes only the e-mail; that is the common case (fixing a typo in the
 * address) and it should not force a password rotation.
 */
export default function AccountPanel({ currentEmail, labels }: AccountPanelProps) {
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSaved(false);

    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;

    startTransition(async () => {
      try {
        const result = await updateAdminCredentials(formData);

        if (result.success) {
          setSaved(true);
          // Clear the secrets but keep the e-mail: the field is the record of
          // what was just saved.
          form.reset();
          const emailInput = form.elements.namedItem("email");
          if (emailInput instanceof HTMLInputElement) {
            emailInput.value = formData.get("email")?.toString() ?? currentEmail;
          }
          return;
        }

        setError(
          formatActionError(labels.errors, result.error, result.values),
        );
      } catch {
        setError(labels.errors.unexpected);
      }
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <SectionHeader
        title={labels.account.heading}
        description={labels.account.description}
      />

      {error && <Alert>{error}</Alert>}
      {saved && <Alert tone="success">{labels.account.success}</Alert>}

      <Panel>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Field htmlFor="account-email" label={labels.account.email}>
            <Input
              id="account-email"
              name="email"
              type="email"
              dir="ltr"
              autoComplete="username"
              defaultValue={currentEmail}
              required
            />
          </Field>

          <Field
            htmlFor="account-current-password"
            label={labels.account.currentPassword}
          >
            <Input
              id="account-current-password"
              name="currentPassword"
              type="password"
              dir="ltr"
              autoComplete="current-password"
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              htmlFor="account-new-password"
              label={labels.account.newPassword}
            >
              <Input
                id="account-new-password"
                name="newPassword"
                type="password"
                dir="ltr"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
              />
            </Field>

            <Field
              htmlFor="account-confirm-password"
              label={labels.account.confirmPassword}
            >
              <Input
                id="account-confirm-password"
                name="confirmPassword"
                type="password"
                dir="ltr"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
              />
            </Field>
          </div>

          <p className="flex items-start gap-2 rounded-lg border border-border-soft bg-bg-elevated/40 p-3 text-xs leading-relaxed text-text-faint">
            <KeyRound className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {interpolate(labels.account.passwordHint, {
              min: MIN_PASSWORD_LENGTH,
            })}
          </p>

          <div className="flex justify-end border-t border-border-soft pt-5">
            <Button type="submit" disabled={isPending} aria-disabled={isPending}>
              <Save aria-hidden="true" />
              {isPending ? labels.account.saving : labels.account.save}
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
