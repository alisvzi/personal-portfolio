"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Send,
  Twitter,
  type LucideIcon,
} from "lucide-react";

import type { Dictionary } from "@/i18n/dictionaries/en";
import { SOCIAL_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Content } from "@/types";
import { SectionHeading } from "./SectionHeading";

interface ContactSectionProps {
  content: Content;
  labels: Dictionary["contact"];
  className?: string;
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

/**
 * Contact chapter.
 *
 * The heading/intro copy is static. Motion lives on the objects: each contact
 * method is a pointer-driven 3D tilt card and the social icons lift on hover.
 * The form logic (validation, submit, success) is unchanged; every column is
 * `min-w-0` and every field `w-full`, so nothing can overflow.
 */
export function ContactSection({ content, labels, className }: ContactSectionProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!formData.name.trim()) nextErrors.name = labels.errors.nameRequired;
    if (!formData.email.trim()) {
      nextErrors.email = labels.errors.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = labels.errors.emailInvalid;
    }
    if (!formData.subject.trim()) {
      nextErrors.subject = labels.errors.subjectRequired;
    }
    if (!formData.message.trim()) {
      nextErrors.message = labels.errors.messageRequired;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));

    if (errors[name as keyof FormData]) {
      setErrors((previous) => ({ ...previous, [name]: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });

      if (!response.ok) throw new Error("send failed");

      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setSubmitError(labels.errors.sendFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { name: "GitHub", icon: Github, url: SOCIAL_LINKS.github, brand: "hover:text-accent" },
    { name: "LinkedIn", icon: Linkedin, url: SOCIAL_LINKS.linkedin, brand: "hover:text-[#0077b5]" },
    { name: "Twitter", icon: Twitter, url: SOCIAL_LINKS.twitter, brand: "hover:text-[#1da1f2]" },
  ];

  const inputClasses = (hasError: boolean) =>
    cn(
      "w-full rounded-lg border bg-bg/50 px-4 py-3 text-text transition-[border-color,box-shadow] duration-200 ease-out",
      "placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent",
      hasError ? "border-app-error" : "border-border-soft hover:border-accent/30",
    );

  return (
    <section
      id="contact"
      className={cn("relative flex min-h-full items-center", className)}
    >
      <div className="chapter-shell grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left: intro + methods + socials */}
        <div className="flex min-w-0 flex-col gap-9">
          <div className="flex flex-col gap-5">
            <SectionHeading index="04" title={labels.heading} />
            <h3
              className="text-safe font-semibold tracking-[-0.02em] text-text"
              style={{ fontSize: "var(--fs-2)", lineHeight: 1.1 }}
            >
              {labels.title}
            </h3>
            <p className="text-safe max-w-prose leading-relaxed text-text-muted">
              {labels.description}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-text-faint">
              {labels.connectHeading}
            </h4>
            <div className="flex flex-col gap-3">
              <ContactMethod
                icon={Mail}
                label={labels.emailLabel}
                value={content.contactEmail}
                href={`mailto:${content.contactEmail}`}
              />
              <ContactMethod
                icon={Phone}
                label={labels.phoneLabel}
                value={content.contactPhone}
                href={`tel:${content.contactPhone}`}
              />
              <ContactMethod
                icon={MapPin}
                label={labels.locationLabel}
                value={labels.location}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-text-faint">
              {labels.followHeading}
            </h4>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  className={cn(
                    "rounded-full border border-border-soft bg-surface/60 p-3 text-text-muted transition-all duration-200 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                    "hover:-translate-y-0.5 hover:border-accent/30",
                    social.brand,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.08, duration: 0.5 }}
                  viewport={{ once: true }}
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="min-w-0 rounded-xl border border-border-soft bg-surface/50 p-6 backdrop-blur-sm sm:p-8">
          {!isSubmitted ? (
            <motion.form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              viewport={{ once: true }}
              noValidate
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="contact-name"
                  label={labels.form.name}
                  error={errors.name}
                >
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={inputClasses(Boolean(errors.name))}
                    placeholder={labels.form.namePlaceholder}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "contact-name-error" : undefined}
                  />
                </Field>

                <Field
                  id="contact-email"
                  label={labels.form.email}
                  error={errors.email}
                >
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClasses(Boolean(errors.email))}
                    placeholder={labels.form.emailPlaceholder}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                  />
                </Field>
              </div>

              <Field
                id="contact-subject"
                label={labels.form.subject}
                error={errors.subject}
              >
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={inputClasses(Boolean(errors.subject))}
                  placeholder={labels.form.subjectPlaceholder}
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                />
              </Field>

              <Field
                id="contact-message"
                label={labels.form.message}
                error={errors.message}
              >
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  className={cn(inputClasses(Boolean(errors.message)), "resize-none")}
                  placeholder={labels.form.messagePlaceholder}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                />
              </Field>

              {submitError && (
                <p
                  role="alert"
                  className="rounded-lg border border-app-error/40 bg-app-error-light/10 p-3 text-sm text-app-error-text"
                >
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-lg px-8 py-4 transition-all duration-200 ease-out",
                  "bg-accent font-mono text-sm font-semibold text-bg",
                  "hover:brightness-95 hover:shadow-glow",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "focus:outline-none focus:ring-2 focus:ring-accent/60",
                )}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-bg/40 border-t-bg"
                    />
                    {labels.form.submitting}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
                    {labels.form.submit}
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              className="py-12 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              role="status"
            >
              <div aria-hidden="true" className="mb-4 text-5xl">
                ✨
              </div>
              <h4
                className="mb-3 font-semibold text-text"
                style={{ fontSize: "var(--fs-2)" }}
              >
                {labels.form.successTitle}
              </h4>
              <p className="mx-auto mb-6 max-w-sm text-text-muted">
                {labels.form.successBody}
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="rounded-lg border border-accent px-6 py-3 font-mono text-sm text-accent transition-all duration-200 ease-out hover:bg-accent-soft focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                {labels.form.sendAnother}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Labelled field with an inline, accessible error slot. */
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-app-error-text">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * A contact row (email / phone / location) as a pointer-driven 3D tilt card.
 * `href` makes it an anchor; otherwise it renders as a static row.
 */
function ContactMethod({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), {
    stiffness: 150,
    damping: 15,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), {
    stiffness: 150,
    damping: 15,
  });

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const card = (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="flex items-center gap-4 rounded-xl border border-border-soft bg-surface/60 p-4 backdrop-blur-sm transition-[border-color,box-shadow] duration-200 ease-out hover:border-accent/50 hover:shadow-glow"
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-soft text-accent transition-colors duration-200 group-hover:bg-accent/20">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-text">{label}</p>
        <p className="truncate text-sm text-text-muted" dir="ltr">
          {value}
        </p>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className="group min-w-0 [perspective:1200px]"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      viewport={{ once: true }}
    >
      {href ? (
        <a
          href={href}
          className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          {card}
        </a>
      ) : (
        card
      )}
    </motion.div>
  );
}

export default ContactSection;
