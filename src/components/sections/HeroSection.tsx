"use client";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";

import { ChevronRight } from "lucide-react";

import { Content } from "../../types";

import { cn, scrollToSection } from "../../lib/utils";
import {
  AnimatedContainer,
  AnimatedItem,
  AnimatedText,
} from "../ui/AnimatedContainer";

interface HeroSectionProps {
  content: Content;
  className?: string;
}

export function HeroSection({ content, className }: HeroSectionProps) {
  const handleContactClick = () => {
    scrollToSection("contact");
  };

  return (
    <section
      id="home"
      className={cn(
        "min-h-screen flex flex-col items-center justify-center text-center px-4",
        "relative overflow-hidden",
        className
      )}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#64ffda]/5 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-[#64ffda]/3 blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            ease: "linear",
          }}
        />
      </div>
      <AnimatedContainer
        variant="stagger"
        className="max-w-4xl mt-10 mx-auto space-y-6 relative z-10"
        viewport={{ once: true, amount: 0.3 }}
        staggerChildren={0.15}
      >
        {/* Badge */}
        <AnimatedItem variant="fadeSlideUp">
          <motion.span
            className="inline-block  text-[#64ffda] font-mono text-lg"
            transition={{ duration: 0.2 }}
          >
            Hi, my name is
          </motion.span>
        </AnimatedItem>

        {/* Main Title */}
        <AnimatedItem variant="fadeSlideUp">
          <AnimatedText
            text={content.heroTitle}
            as="h1"
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#ccd6f6] leading-tight"
            splitBy="word"
          />
        </AnimatedItem>

        {/* Subtitle */}
        <AnimatedItem variant="fadeSlideUp">
          <AnimatedText
            text={content.heroSubtitle}
            as="h2"
            className="text-3xl md:text-6xl lg:text-7xl font-bold text-[#8892b0] leading-tight"
            splitBy="word"
          />
        </AnimatedItem>

        {/* Description */}
        <AnimatedItem variant="fadeSlideUp">
          <p className="text-lg md:text-xl lg:text-2xl text-[#8892b0] max-w-2xl mx-auto leading-relaxed">
            {content.heroDescription}
          </p>
        </AnimatedItem>

        {/* CTA Button */}
        <AnimatedItem variant="fadeScale" className="space-x-6">
          <button
            onClick={handleContactClick}
            className={cn(
              "group inline-flex items-center gap-3 px-8 py-4 mt-8",
              "border-2 border-[#64ffda] text-[#64ffda] rounded-lg",
              "font-mono text-sm tracking-wide",
              "transition-all duration-300",
              "hover:bg-[#64ffda]/10 hover:shadow-lg hover:shadow-[#64ffda]/25",
              "focus:outline-none focus:ring-2 focus:ring-[#64ffda]/50",
              "active:scale-95"
            )}
          >
            <span>Get In Touch</span>
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group inline-flex items-center gap-3 px-8 py-4 mt-8",
              "bg-[#64ffda] text-background rounded-lg",
              "font-mono font-bold text-sm tracking-wide",
              "transition-all duration-300",
              "hover:bg-[#64ffda]/70 hover:shadow-lg hover:shadow-[#64ffda]/25",
              "focus:outline-none focus:ring-2 focus:ring-[#64ffda]/50",
              "active:scale-95"
            )}
          >
            Download Resume
            <svg
              className="ml-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
          </a>
        </AnimatedItem>

        {/* Scroll Indicator */}
        <AnimatedItem variant="fadeSlideUp" className="pt-16">
          <motion.div
            className="flex flex-col items-center space-y-2 text-[#8892b0]"
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 2,
              ease: "easeInOut",
            }}
          >
            <span className="text-xs font-mono">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-[#8892b0] rounded-full flex justify-center">
              <motion.div
                className="w-1 h-3 bg-[#8892b0] rounded-full mt-2"
                animate={{ y: [0, 12, 0] }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </AnimatedItem>
      </AnimatedContainer>
    </section>
  );
}

export default HeroSection;
