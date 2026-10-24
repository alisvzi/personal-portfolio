import type { Dictionary } from "@/i18n/dictionaries/en";

/**
 * The slice of the dictionary the admin dashboard needs.
 *
 * Assembled in the admin Server Component and passed down once, so panels do
 * not each import the dictionary (which would ship every string to the
 * browser) and so the whole dashboard switches language together.
 */
export interface AdminLabels {
  title: string;
  logout: string;
  tabs: Dictionary["admin"]["tabs"];
  actions: Dictionary["admin"]["actions"];
  errors: Dictionary["admin"]["errors"];
  confirm: Dictionary["admin"]["confirm"];
  projects: Dictionary["admin"]["projects"];
  skills: Dictionary["admin"]["skills"];
  experiences: Dictionary["admin"]["experiences"];
  content: Dictionary["admin"]["content"];
  messages: Dictionary["admin"]["messages"];
  account: Dictionary["admin"]["account"];
}
