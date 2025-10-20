"use client";

import { useState, useEffect } from "react";
import { NAVIGATION_SECTIONS, SCROLL_CONFIG } from "@/lib/constants";

export function useScrollSpy() {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + SCROLL_CONFIG.offset;

      // Find the current section based on scroll position
      for (let i = NAVIGATION_SECTIONS.length - 1; i >= 0; i--) {
        const section = NAVIGATION_SECTIONS[i];
        const element = document.getElementById(section.id);

        if (element) {
          const { offsetTop } = element;
          if (scrollPosition >= offsetTop) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    // Set initial active section
    handleScroll();

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return { activeSection, setActiveSection };
}
