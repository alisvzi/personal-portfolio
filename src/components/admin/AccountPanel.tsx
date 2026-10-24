"use client";

import { KeyRound, Save } from "lucide-react";
import { useState, useTransition } from "react";

import { updateAdminCredentials } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatActionError, interpolate } from "@/i18n/format";
import type { AdminLabels } from "./types";

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
 * The panel is deliberately its own tab rather than a row inside "Content":
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
    <div className="max-w-xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-text">{labels.account.heading}</h2>
        <p className="text-sm text-text-muted">{labels.account.description}</p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-app-error/40 bg-app-error-light/10 p-3 text-sm text-app-error-text"
        >
          {error}
        </div>
      )}

      {saved && (
        <div
          role="status"
          className="rounded-md border border-accent/40 bg-accent-soft p-3 text-sm text-accent"
        >
          {labels.account.success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-md border p-5"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="account-email">{labels.account.email}</Label>
          <Input
            id="account-email"
            name="email"
            type="email"
            dir="ltr"
            autoComplete="username"
            defaultValue={currentEmail}
            className="w-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account-current-password">
            {labels.account.currentPassword}
          </Label>
          <Input
            id="account-current-password"
            name="currentPassword"
            type="password"
            dir="ltr"
            autoComplete="current-password"
            className="w-full"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="account-new-password">
              {labels.account.newPassword}
            </Label>
            <Input
              id="account-new-password"
              name="newPassword"
              type="password"
              dir="ltr"
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-confirm-password">
              {labels.account.confirmPassword}
            </Label>
            <Input
              id="account-confirm-password"
              name="confirmPassword"
              type="password"
              dir="ltr"
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              className="w-full"
            />
          </div>
        </div>

        <p className="flex items-start gap-2 text-xs text-text-faint">
          <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {interpolate(labels.account.passwordHint, {
            min: MIN_PASSWORD_LENGTH,
          })}
        </p>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} aria-disabled={isPending}>
            <Save className="me-2 h-4 w-4" aria-hidden="true" />
            {isPending ? labels.account.saving : labels.account.save}
          </Button>
        </div>
      </form>
    </div>
  );
}
