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
            repeat: Infinity,
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
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      <AnimatedContainer
        variant="stagger"
        className="max-w-4xl mx-auto space-y-6 relative z-10"
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
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#8892b0] leading-tight"
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
        <AnimatedItem variant="fadeScale">
          <motion.button
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Get In Touch</span>
            <motion.div
              className="group-hover:translate-x-1 transition-transform duration-200"
              whileHover={{ x: 5 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </AnimatedItem>

        {/* Scroll Indicator */}
        <AnimatedItem variant="fadeSlideUp" className="pt-16">
          <motion.div
            className="flex flex-col items-center space-y-2 text-[#8892b0]"
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
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
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </AnimatedItem>
      </AnimatedContainer>

      {/* Social Links - Floating */}
      <motion.div
        className="absolute left-8 bottom-8 hidden lg:flex flex-col items-center space-y-4"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <div className="flex flex-col space-y-4">
          {[
            {
              name: "github",
              icon: Github,
              link: "https://github.com/yourprofile",
            },
            {
              name: "linkedin",
              icon: Linkedin,
              link: "https://linkedin.com/in/yourprofile",
            },
            {
              name: "twitter",
              icon: Twitter,
              link: "https://twitter.com/yourprofile",
            },
          ].map(({ name, icon: Icon, link }, index) => (
            <motion.a
              key={name}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              className="text-[#8892b0] hover:text-[#64ffda] transition-colors"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 + index * 0.1 }}
            >
              <Icon className="w-5 h-5" />
            </motion.a>
          ))}
        </div>
        <motion.div
          className="w-px h-20 bg-[#8892b0]"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        />
      </motion.div>

      {/* Email - Floating */}
      <motion.div
        className="absolute right-8 bottom-8 hidden lg:flex flex-col items-center space-y-4"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.a
          href={`mailto:${content.contactEmail}`}
          className="text-[#8892b0] hover:text-[#64ffda] transition-colors font-mono text-sm tracking-widest"
          style={{ writingMode: "vertical-rl" }}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          {content.contactEmail}
        </motion.a>
        <motion.div
          className="w-px h-20 bg-[#8892b0]"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        />
      </motion.div>
    </section>
  );
}

export default HeroSection;
