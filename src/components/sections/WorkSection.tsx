"use client";
// components/WorkSection.tsx
import {
  AnimatedContainer,
  AnimatedItem,
} from "@/components/ui/AnimatedContainer";
import { cardHover } from "@/lib/animations";
import {
  cn,
  formatTechnologies,
  getGithubUrl,
  getProjectUrl,
} from "@/lib/utils";
import { Project } from "@/types";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import ProjectCard from "./ProjectCard";

interface WorkSectionProps {
  projects: Project[];
  className?: string;
}

export function WorkSection({ projects, className }: WorkSectionProps) {
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
  const otherProjects = projects.filter((p) => !p.featured).slice(0, 6);

  if (!projects || !Array.isArray(projects)) {
    return (
      <section
        className={cn(
          "min-h-screen flex items-center justify-center",
          className
        )}
      >
        <p className="text-[#ccd6f6]">No projects found</p>
      </section>
    );
  }

  return (
    <section
      id="work"
      className={cn("min-h-screen py-20 relative overflow-hidden", className)}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute bottom-1/3 -right-32 w-96 h-96 rounded-full bg-[#64ffda]/4 blur-3xl"
          animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
          transition={{ duration: 40, ease: "linear" }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <AnimatedContainer
          variant="slideRight"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-16"
        >
          <AnimatedItem>
            <div className="flex items-center mb-16">
              <motion.span
                className="text-[#64ffda] font-mono text-lg mr-4"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                03.
              </motion.span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#ccd6f6]">
                Some Things I&apos;ve Built
              </h2>
              <motion.div
                className="flex-1 h-px bg-gradient-to-r from-[#233554] to-transparent ml-8"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                viewport={{ once: true }}
              />
            </div>
          </AnimatedItem>

          {featuredProjects.length > 0 ? (
            <div className="space-y-24">
              {featuredProjects.map((project, index) => {
                return (
                  <ProjectCard
                    index={index}
                    project={project}
                    key={project._id}
                  />
                );
              })}
            </div>
          ) : (
            <AnimatedItem variant="fadeSlideUp" className="text-center py-20">
              <div className="space-y-4">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-2xl font-bold text-[#ccd6f6]">
                  Projects Coming Soon
                </h3>
                <p className="text-[#8892b0] max-w-md mx-auto">
                  I&apos;m currently working on some exciting projects. Check
                  back soon to see what I&apos;ve been building!
                </p>
              </div>
            </AnimatedItem>
          )}

          {otherProjects.length > 0 && (
            <AnimatedItem variant="fadeSlideUp" className="pt-16">
              <div className="text-center mb-12">
                <h3 className="text-2xl md:text-3xl font-bold text-[#ccd6f6] mb-4">
                  Other Projects
                </h3>
                <p className="text-[#8892b0]">
                  A selection of other projects I&apos;ve worked on
                </p>
              </div>
              <motion.div
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
                  },
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {otherProjects.map((project) => (
                  <motion.div
                    key={project._id}
                    className="bg-[#112240] p-6 rounded-lg border border-[#233554] group hover:border-[#64ffda]/20 transition-all duration-300"
                    variants={cardHover}
                    whileHover="hover"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-[#64ffda]">
                        <svg
                          className="w-10 h-10"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                          <path d="M14 2v6h6" />
                          <path d="M16 13H8" />
                          <path d="M16 17H8" />
                          <path d="M10 9H8" />
                        </svg>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={getGithubUrl(project)}
                          className="text-[#8892b0] hover:text-[#64ffda] transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                        <a
                          href={getProjectUrl(project)}
                          className="text-[#8892b0] hover:text-[#64ffda] transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                    <h4 className="text-xl font-semibold text-[#ccd6f6] mb-3 group-hover:text-[#64ffda] transition-colors">
                      {project.title}
                    </h4>
                    <p className="text-[#8892b0] text-sm leading-relaxed mb-4">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {formatTechnologies(project.technologies)
                        .slice(0, 3)
                        .map((tech) => (
                          <span
                            key={tech}
                            className="text-[#8892b0] text-xs font-mono"
                          >
                            {tech}
                          </span>
                        ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatedItem>
          )}

          <AnimatedItem variant="fadeSlideUp" className="text-center pt-12">
            <motion.a
              href="#"
              className="inline-flex items-center px-6 py-3 border border-[#64ffda] text-[#64ffda] rounded-lg hover:bg-[#64ffda]/10 transition-all duration-300 font-mono text-sm"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              View Archive
              <ExternalLink className="ml-2 w-4 h-4" />
            </motion.a>
          </AnimatedItem>
        </AnimatedContainer>
      </div>
    </section>
  );
}

export default WorkSection;
