import { Project } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---------- Format Utils ----------

/** Splits the comma-separated technology list stored on a project. */
export function formatTechnologies(technologies: string): string[] {
  return technologies
    .split(",")
    .map((tech) => tech.trim())
    .filter(Boolean);
}

// ---------- URL Utils ----------

/**
 * True only for absolute http(s) URLs.
 *
 * `new URL()` alone accepts `javascript:` and `data:` URLs, which must never
 * reach an `href`. Used as a type guard so callers can render the link only
 * when a real URL exists instead of falling back to a dead `href="#"`.
 */
export function isValidUrl(url: string | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function getProjectUrl(project: Project): string | undefined {
  return isValidUrl(project.projectUrl) ? project.projectUrl : undefined;
}

export function getGithubUrl(project: Project): string | undefined {
  return isValidUrl(project.githubUrl) ? project.githubUrl : undefined;
}

// ---------- Scroll Utils ----------

export function scrollToSection(sectionId: string): void {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// ---------- Encoding Utils ----------

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
