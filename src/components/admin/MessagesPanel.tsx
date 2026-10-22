"use client";

import { MessageSquare, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { htmlLang, type Locale } from "@/i18n/config";
import { interpolate } from "@/i18n/format";
import type { AdminLabels } from "./types";

type Message = {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: string;
  read: boolean;
};

interface MessagesPanelProps {
  locale: Locale;
  labels: AdminLabels;
}

/** Loads the contact inbox. See ProjectsPanel for the pattern note. */
async function loadMessages(): Promise<Message[]> {
  const response = await fetch("/api/contact");
  if (!response.ok) throw new Error("fetch failed");

  const data = (await response.json()) as unknown;
  return Array.isArray(data) ? (data as Message[]) : [];
}

export default function MessagesPanel({ locale, labels }: MessagesPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setMessages(await loadMessages());
      setFormError("");
    } catch {
      setFormError(labels.errors.loadFailed);
    }
  }, [labels.errors.loadFailed]);

  useEffect(() => {
    let cancelled = false;

    loadMessages()
      .then((items) => {
        if (cancelled) return;
        setMessages(items);
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

  const handleMarkAsRead = async (id: string) => {
    setBusyId(id);
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });

      if (!response.ok) throw new Error("update failed");
      await refresh();
    } catch {
      setFormError(labels.errors.saveFailed);
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm(labels.confirm.deleteMessage)) return;

    setBusyId(id);
    try {
      const response = await fetch(`/api/contact/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("delete failed");
      await refresh();
    } catch {
      setFormError(labels.errors.deleteFailed);
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return <p className="text-text-muted">{labels.messages.loading}</p>;
  }

  const unreadCount = messages.filter((message) => !message.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">
          {labels.messages.heading}
        </h2>
        <div className="flex gap-2">
          <Badge variant="outline">
            {interpolate(labels.messages.total, { count: messages.length })}
          </Badge>
          <Badge variant="secondary">
            {interpolate(labels.messages.unread, { count: unreadCount })}
          </Badge>
        </div>
      </div>

      {formError && (
        <div
          role="alert"
          className="rounded-md border border-app-error/40 bg-app-error-light/10 p-3 text-sm text-app-error-text"
        >
          {formError}
        </div>
      )}

      {messages.length === 0 && !formError ? (
        <div className="rounded-md border p-8 text-center">
          <MessageSquare
            className="mx-auto h-12 w-12 text-text-faint"
            aria-hidden="true"
          />
          <p className="mt-2 text-text-muted">{labels.messages.empty}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              locale={locale}
              labels={labels}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteMessage}
              isBusy={busyId === message.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface MessageCardProps {
  message: Message;
  locale: Locale;
  labels: AdminLabels;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isBusy: boolean;
}

function MessageCard({
  message,
  locale,
  labels,
  onMarkAsRead,
  onDelete,
  isBusy,
}: MessageCardProps) {
  // Rendered in the dashboard's language, not the browser's, so a Persian
  // admin sees Persian digits and date order even on an English-locale machine.
  const date = new Date(message.createdAt).toLocaleString(htmlLang[locale]);

  return (
    <Card className={message.read ? "opacity-75" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{message.name}</CardTitle>
            <a
              href={`mailto:${message.email}`}
              className="text-sm text-accent"
              dir="ltr"
            >
              {message.email}
            </a>
          </div>
          <div className="flex items-center gap-2">
            {!message.read && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkAsRead(message.id)}
                disabled={isBusy}
              >
                {labels.actions.markAsRead}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(message.id)}
              disabled={isBusy}
              aria-label={labels.actions.delete}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {message.subject && (
            <p className="text-sm font-medium">{message.subject}</p>
          )}
          {message.message && (
            <p className="whitespace-pre-wrap">{message.message}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">{date}</span>
            {!message.read && <Badge>{labels.messages.newBadge}</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
