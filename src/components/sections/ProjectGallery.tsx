"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { thumbHashToDataURL } from "thumbhash";

import { interpolate } from "@/i18n/format";
import { cn, base64ToUint8Array } from "@/lib/utils";

/**
 * Project screenshot gallery with a full-size viewer.
 *
 * The grid is server-rendered markup handed to a Client Component: the page
 * still ships complete `<img>` elements for crawlers and for visitors with
 * JavaScript disabled, and only the enlargement behaviour needs hydration.
 *
 * The viewer is a plain overlay rather than a native `<dialog>`: `showModal()`
 * has to be called imperatively from an effect, which fights React 19's
 * double-invoked effects in development, and it would need its own stylesheet
 * reset anyway. The behaviour that matters — Escape to close, arrow keys to
 * step, focus moved into the viewer and restored on close, background scroll
 * locked — is implemented explicitly below.
 */

export interface GalleryImage {
  url: string;
  placeholder?: string;
}

export interface GalleryLabels {
  gallery: string;
  galleryHint: string;
  imageAlt: string;
  openImage: string;
  closeImage: string;
  previousImage: string;
  nextImage: string;
  imageCounter: string;
}

interface ProjectGalleryProps {
  images: readonly GalleryImage[];
  title: string;
  labels: GalleryLabels;
}

/** ThumbHash payload → data URL, or `undefined` when absent/corrupt. */
function placeholderFor(image: GalleryImage): string | undefined {
  if (!image.placeholder) return undefined;

  try {
    return thumbHashToDataURL(base64ToUint8Array(image.placeholder));
  } catch {
    // A malformed hash must not take the whole page down.
    return undefined;
  }
}

export default function ProjectGallery({
  images,
  title,
  labels,
}: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const total = images.length;
  const isOpen = activeIndex !== null;

  const close = useCallback(() => {
    setActiveIndex(null);
    // Return focus to the thumbnail that opened the viewer, so keyboard users
    // resume where they left off instead of at the top of the document.
    triggerRef.current?.focus();
  }, []);

  const step = useCallback(
    (delta: number) => {
      setActiveIndex((current) => {
        if (current === null) return current;
        return (current + delta + total) % total;
      });
    },
    [total],
  );

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      }
    };

    // Locking the body keeps the page behind the overlay from scrolling on
    // touch devices, where the overlay itself does not consume the gesture.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close, step]);

  if (total === 0) return null;

  const active = activeIndex === null ? null : images[activeIndex];

  return (
    <section className="mt-14">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-mono text-xs tracking-[var(--ls-eyebrow)] text-text-faint uppercase">
          {labels.gallery}
        </h2>
        <p className="text-xs text-text-faint">{labels.galleryHint}</p>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.map((image, index) => {
          const placeholder = placeholderFor(image);
          const alt = interpolate(labels.imageAlt, {
            title,
            index: index + 1,
          });

          return (
            <li
              key={`${image.url}-${index}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border-soft bg-surface-2"
            >
              <Image
                src={image.url}
                alt={alt}
                fill
                sizes="(max-width: 640px) 100vw, 45vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                placeholder={placeholder ? "blur" : "empty"}
                blurDataURL={placeholder || undefined}
              />

              {/* The button is the interactive layer on top of the image, so
                  the image itself stays a plain, cacheable `<img>`. */}
              <button
                type="button"
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setActiveIndex(index);
                }}
                aria-label={interpolate(labels.openImage, {
                  index: index + 1,
                  total,
                })}
                className="absolute inset-0 cursor-zoom-in rounded-lg focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none"
              />
            </li>
          );
        })}
      </ul>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={labels.gallery}
          className="fixed inset-0 z-[100] flex flex-col bg-black/92 backdrop-blur-sm"
          onClick={close}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <span className="font-mono text-xs text-white/70">
              {interpolate(labels.imageCounter, {
                index: (activeIndex ?? 0) + 1,
                total,
              })}
            </span>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              aria-label={labels.closeImage}
              className="rounded-full border border-white/20 p-2 text-white/80 transition-colors hover:border-white/40 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-16">
            {/* Clicks inside the frame must not close the viewer. */}
            <div
              className="relative h-full w-full"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={active.url}
                alt={interpolate(labels.imageAlt, {
                  title,
                  index: (activeIndex ?? 0) + 1,
                })}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(-1);
                  }}
                  aria-label={labels.previousImage}
                  className={cn(
                    "absolute start-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white/80",
                    "transition-colors hover:border-white/40 hover:text-white",
                    "focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none sm:start-6",
                  )}
                >
                  <ArrowLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(1);
                  }}
                  aria-label={labels.nextImage}
                  className={cn(
                    "absolute end-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white/80",
                    "transition-colors hover:border-white/40 hover:text-white",
                    "focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none sm:end-6",
                  )}
                >
                  <ArrowRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
