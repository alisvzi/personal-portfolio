"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { loginAdmin } from "@/app/actions/auth";
import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { formatActionError } from "@/i18n/format";
import type { Locale } from "@/i18n/config";
import { Alert, Field, Panel } from "./ui";

interface LoginFormProps {
  locale: Locale;
  labels: Dictionary["login"];
}

/**
 * Sign-in screen.
 *
 * Centred single column with the mark above the form: the dashboard it leads to
 * is a sidebar layout, so the entry point reads as the same product rather than
 * a generic card floating on an empty page.
 */
export default function LoginForm({ locale, labels }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    setError("");

    startTransition(async () => {
      try {
        const result = await loginAdmin(formData);

        if (result.success) {
          // The proxy sends signed-in visitors away from the sign-in page, so a
          // refresh is all that is needed to land on the dashboard.
          router.replace(`/${locale}/admin`);
          router.refresh();
        } else {
          setError(formatActionError(labels.errors, result.error, result.values));
        }
      } catch {
        // Without this the form would stay in its pending state forever on a
        // dropped connection, with no feedback at all.
        setError(labels.errors.unavailable);
      }
    });
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-bg px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 start-1/2 size-[34rem] -translate-x-1/2 rounded-full bg-accent-soft blur-[120px]"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <BrandMark className="size-12" />
          <div>
            <h1 className="text-xl font-semibold text-text">{labels.title}</h1>
            <p className="mt-1 text-sm text-text-muted">{labels.subtitle}</p>
          </div>
        </div>

        <Panel className="bg-surface/70">
          <form action={handleSubmit} className="space-y-4">
            {error && <Alert>{error}</Alert>}

            <Field htmlFor="email" label={labels.email}>
              <Input
                id="email"
                name="email"
                type="email"
                dir="ltr"
                autoComplete="username"
                required
              />
            </Field>

            <Field htmlFor="password" label={labels.password}>
              <Input
                id="password"
                name="password"
                type="password"
                dir="ltr"
                autoComplete="current-password"
                required
              />
            </Field>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isPending}
              aria-disabled={isPending}
            >
              {isPending ? labels.submitting : labels.submit}
            </Button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
