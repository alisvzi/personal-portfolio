import { Briefcase, FolderOpen, Home, Mail, User, type LucideIcon } from "lucide-react";

import type { SectionId } from "@/types";

/**
 * Landing page navigation.
 *
 * Only the anchor id and icon live here: the visible label and the accessible
 * name come from the locale dictionary, so the same list drives both languages
 * and cannot drift out of sync with the translations.
 */
export interface NavigationItem {
  id: SectionId;
  icon: LucideIcon;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: "home", icon: Home },
  { id: "about", icon: User },
  { id: "experience", icon: Briefcase },
  { id: "work", icon: FolderOpen },
  { id: "contact", icon: Mail },
];

/** `scrollToSection`/scroll-spy offset in pixels, to clear the fixed header. */
export const SCROLL_CONFIG = {
  offset: 100,
} as const;

/**
 * The person this site is about.
 *
 * One record, one spelling. The name used to be typed independently into the
 * dictionaries, the content defaults, the Open Graph card and the structured
 * data — which is exactly how a Persian page ends up shipping the Latin name.
 * Everything that renders a name now reads from here, so the two scripts can
 * never drift apart again.
 */
export const PERSON = {
  /** Latin spelling: English pages, code artifacts, OG cards, `alternateName`. */
  nameEn: "Ali Soveizi",
  /** Persian spelling: Persian pages, Persian metadata, `name` in fa JSON-LD. */
  nameFa: "علی سویزی",
} as const;

/** The person's name in the script of the given locale. */
export function personName(locale: "fa" | "en"): string {
  return locale === "fa" ? PERSON.nameFa : PERSON.nameEn;
}


/**
 * Public profile links used by the contact section, the floating side bar and
 * the `Person` structured data. Defined once so the three cannot disagree —
 * they previously pointed at two different GitHub handles.
 */
export const SOCIAL_LINKS = {
  github: "https://github.com/alisvzi",
  linkedin: "https://linkedin.com/in/ali-soveizi",
  twitter: "https://twitter.com/alisvzi",
} as const;
