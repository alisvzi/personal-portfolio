import { Project } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---------- Format Utils ----------
export function formatTechnologies(technologies: string): string[] {
  return technologies
    .split(",")
    .map((tech) => tech.trim())
    .filter(Boolean);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, "") + "...";
}

// ---------- URL Utils ----------
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getProjectUrl(project: Project): string {
  return isValidUrl(project.projectUrl) ? project.projectUrl : "#";
}

export function getGithubUrl(project: Project): string {
  return isValidUrl(project.githubUrl) ? project.githubUrl : "#";
}

// ---------- Animation Utils ----------
export function getStaggerDelay(
  index: number,
  baseDelay: number = 0.1
): number {
  return index * baseDelay;
}

// ---------- Scroll Utils ----------
export function scrollToSection(sectionId: string): void {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// ---------- SEO Utils ----------
export function generatePageTitle(section?: string): string {
  const baseTitle = "John Doe - Frontend Developer";
  return section ? `${section} | ${baseTitle}` : baseTitle;
}

export function generateMetaDescription(section?: string): string {
  const descriptions = {
    about:
      "Learn more about John Doe, a passionate frontend developer specializing in React and Next.js",
    experience:
      "Explore John Doe's professional experience and career journey in web development",
    work: "View John Doe's portfolio of projects and creative work in frontend development",
    contact:
      "Get in touch with John Doe for collaboration opportunities and inquiries",
  };

  return section && descriptions[section as keyof typeof descriptions]
    ? descriptions[section as keyof typeof descriptions]
    : "Portfolio of John Doe - Frontend Developer building exceptional digital experiences with React, Next.js, and modern web technologies";
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
