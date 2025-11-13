"use client";

import { usePortfolioData } from "@/hooks/usePortfolioData";
import { fadeIn } from "@/lib/animations";
import { motion } from "framer-motion";
import AboutSection from "./sections/AboutSection";
import ContactSection from "./sections/ContactSection";
import ExperienceSection from "./sections/ExperienceSection";
import HeroSection from "./sections/HeroSection";
import WorkSection from "./sections/WorkSection";
import { FullScreenLoading } from "./ui/LoadingSpinner";

interface PortfolioProps {
  className?: string;
}

export default function Portfolio({ className }: PortfolioProps) {
  const { data, isLoading, error } = usePortfolioData();

  if (isLoading) {
    return <FullScreenLoading message="Loading portfolio..." />;
  }

  if (error) {
    return (
      <div
        className={
          "min-h-screen bg-[#0a192f] flex flex-col items-center justify-center"
        }
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-[#ccd6f6]">
            Oops! Something went wrong
          </h1>
          <p className="text-[#8892b0] max-w-md">
            {error ||
              "Failed to load portfolio data. Please try refreshing the page."}
          </p>
          <motion.button
            onClick={() => window.location.reload()}
            className="px-6 py-3 border border-[#64ffda] text-[#64ffda] rounded-lg hover:bg-[#64ffda]/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const { projects, skills, content, experiences } = data;

  return (
    <motion.div
      className={`min-h-screen bg-[#0a192f] text-[#ccd6f6] font-sans ${
        className || ""
      }`}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <HeroSection content={content} className="" />

        {/* Content Sections Container */}
        <div className="mx-auto space-y-32">
          {/* About Section */}
          <AboutSection content={content} skills={skills?.skills} />

          {/* Experience Section */}
          <ExperienceSection experience={experiences?.experiences} />

          {/* Work/Projects Section */}
          <WorkSection projects={projects?.projects} />

          {/* Contact Section */}
          <ContactSection content={content} />
        </div>

        {/* Background Decorative Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <motion.div
            className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#64ffda]/2 blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 30,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-[#64ffda]/1 blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 25,
              ease: "linear",
            }}
          />
        </div>
      </main>
    </motion.div>
  );
}
