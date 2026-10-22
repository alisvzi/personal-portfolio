"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { loginAdmin } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { formatActionError } from "@/i18n/format";
import type { Locale } from "@/i18n/config";

interface LoginFormProps {
  locale: Locale;
  labels: Dictionary["login"];
}

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
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <Card className="w-full max-w-md border-border-soft bg-surface">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-text">
            {labels.title}
          </CardTitle>
          <p className="text-center text-sm text-text-muted">{labels.subtitle}</p>
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
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text">
                {labels.email}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-text">
                {labels.password}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
              aria-disabled={isPending}
            >
              {isPending ? labels.submitting : labels.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
