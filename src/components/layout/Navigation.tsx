"use client";

import { motion } from "framer-motion";
import { useScrollSpy } from "../../hooks/useScrollSpy";
import { fadeIn, slideInLeft } from "../../lib/animations";
import { NAVIGATION_SECTIONS } from "../../lib/constants";
import { cn, scrollToSection } from "../../lib/utils";

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className }: NavigationProps) {
  const { activeSection } = useScrollSpy();

  const handleNavigationClick = (sectionId: string) => {
    scrollToSection(sectionId);
  };

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={slideInLeft}
      className={
        " fixed bottom-0 left-0 right-0 h-20 z-50 md:h-24 px-4 sm:w-[350px] mx-auto"
      }
    >
      <motion.ul
        className="flex items-center justify-center space-x-4 bg-[#64ffda]/5 backdrop-blur-lg px-2 py-1 rounded-2xl border border-[#233554]/30 shadow-xl"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.2,
            },
          },
        }}
      >
        {NAVIGATION_SECTIONS.map((section, idx) => (
          <motion.li key={section.id} variants={fadeIn} className="relative">
            <button
              onClick={() => handleNavigationClick(section.id)}
              className={cn(
                "relative group flex flex-col items-center transition-all duration-300 p-1.5 rounded-lg",
                "hover:bg-[#64ffda]/10 focus:outline-none focus:ring-2 focus:ring-[#64ffda]/20 ring-inset",
                "md:p-2", // Responsive padding
                activeSection === section.id
                  ? "text-[#64ffda] font-medium"
                  : "text-[#8892b0] hover:text-[#ccd6f6]"
              )}
              aria-label={`Navigate to ${section.name} section`}
            >
              {/* Section Number */}
              <span className="text-xs font-mono mb-0.5 group-hover:text-[#64ffda] transition-colors tracking-wider">
                {String(idx + 1).padStart(2, "0")}
              </span>

              {/* Icon Container */}
              <div className="relative w-8 h-8 grid place-items-center">
                <section.icon className="w-5 h-5 transition-transform group-hover:scale-110 will-change-transform" />

                {/* Active Indicator Line */}
                <motion.div
                  className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-5 h-[2px] bg-[#64ffda] rounded-full will-change-transform"
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: activeSection === section.id ? 1 : 0,
                    opacity: activeSection === section.id ? 1 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                />

                {/* Hover Glow Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-[#64ffda]/20 mix-blend-soft-light"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.5, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                />
              </div>

              {/* Tooltip with Downward Arrow */}
              <div className="absolute bottom-full mb-2 px-2 py-1 bg-[#112240]/90 backdrop-blur-sm text-[#ccd6f6] text-xs rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap border border-[#233554] shadow-lg transform -translate-x-1/2 left-1/2">
                {section.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#112240] border-b border-l border-[#233554] rotate-45" />
              </div>
            </button>
          </motion.li>
        ))}
      </motion.ul>
    </motion.nav>
  );
}
