"use client";

import { useState, useEffect } from "react";

import { NAVIGATION_ITEMS, SCROLL_CONFIG } from "@/lib/constants";
import type { SectionId } from "@/types";

/**
 * Tracks which landing page section is currently in view.
 *
 * The section list is shared with the navigation component so the highlight
 * can never point at a section the navigation does not link to.
 */
export function useScrollSpy(): {
  activeSection: SectionId;
  setActiveSection: (section: SectionId) => void;
} {
  const [activeSection, setActiveSection] = useState<SectionId>("home");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + SCROLL_CONFIG.offset;

      // Walk backwards so the last section whose top has been passed wins.
      for (let i = NAVIGATION_ITEMS.length - 1; i >= 0; i -= 1) {
        const { id } = NAVIGATION_ITEMS[i];
        const element = document.getElementById(id);

        if (element && scrollPosition >= element.offsetTop) {
          setActiveSection(id);
          break;
        }
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return { activeSection, setActiveSection };
}
