"use client";

import { MessageSquare, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { htmlLang, type Locale } from "@/i18n/config";
import { interpolate } from "@/i18n/format";
import { cn } from "@/lib/utils";
import type { AdminLabels } from "./types";
import { Alert, EmptyState, Panel, SectionHeader } from "./ui";

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
    return <p className="text-sm text-text-muted">{labels.messages.loading}</p>;
  }

  const unreadCount = messages.filter((message) => !message.read).length;

  return (
    <div className="space-y-6">
      <SectionHeader title={labels.messages.heading}>
        <Badge variant="outline">
          {interpolate(labels.messages.total, { count: messages.length })}
        </Badge>
        <Badge variant={unreadCount > 0 ? "default" : "secondary"}>
          {interpolate(labels.messages.unread, { count: unreadCount })}
        </Badge>
      </SectionHeader>

      {formError && <Alert>{formError}</Alert>}

      {messages.length === 0 && !formError ? (
        <EmptyState icon={MessageSquare} title={labels.messages.empty} />
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <MessageRow
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

interface MessageRowProps {
  message: Message;
  locale: Locale;
  labels: AdminLabels;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isBusy: boolean;
}

function MessageRow({
  message,
  locale,
  labels,
  onMarkAsRead,
  onDelete,
  isBusy,
}: MessageRowProps) {
  // Rendered in the dashboard's language, not the browser's, so a Persian
  // admin sees Persian digits and date order even on an English-locale machine.
  const date = new Date(message.createdAt).toLocaleString(htmlLang[locale]);

  return (
    <Panel
      className={cn(
        message.read ? "opacity-70" : "border-accent-line/50",
        "hover:border-border-strong",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-text">{message.name}</h3>
            {!message.read && (
              <Badge>{labels.messages.newBadge}</Badge>
            )}
          </div>
          <a
            href={`mailto:${message.email}`}
            className="text-sm text-accent-strong underline-offset-4 hover:underline"
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
            size="icon-sm"
            onClick={() => onDelete(message.id)}
            disabled={isBusy}
            aria-label={labels.actions.delete}
            className="hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-200"
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </div>

      {message.subject && (
        <p className="mt-3 text-sm font-medium text-text">{message.subject}</p>
      )}
      {message.message && (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-muted">
          {message.message}
        </p>
      )}
      <p className="mt-3 font-mono text-xs text-text-faint">{date}</p>
    </Panel>
  );
}
