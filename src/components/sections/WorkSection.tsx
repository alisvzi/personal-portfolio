import { motion } from "framer-motion";
import { Github, ExternalLink, Eye } from "lucide-react";
import { Project } from "@/types";
import {
  AnimatedContainer,
  AnimatedItem,
} from "@/components/ui/AnimatedContainer";
import { cardHover } from "@/lib/animations";
import {
  cn,
  formatTechnologies,
  getProjectUrl,
  getGithubUrl,
} from "@/lib/utils";

interface WorkSectionProps {
  projects: Project[];
  className?: string;
}

export function WorkSection({ projects, className }: WorkSectionProps) {
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
  const otherProjects = projects.filter((p) => !p.featured).slice(0, 6);

  return (
    <section
      id="work"
      className={cn(
        "min-h-screen py-20",
        "relative overflow-hidden",
        className,
      )}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute bottom-1/3 -right-32 w-96 h-96 rounded-full bg-[#64ffda]/4 blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <AnimatedContainer
          variant="slideRight"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-16"
        >
          {/* Section Title */}
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

          {/* Featured Projects */}
          {featuredProjects.length > 0 ? (
            <div className="space-y-24">
              {featuredProjects.map((project, index) => (
                <AnimatedItem
                  key={project.id}
                  variant="fadeSlideUp"
                  className="relative"
                >
                  <motion.div
                    className="grid md:grid-cols-12 gap-8 items-center"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.8 }}
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    {/* Project Image */}
                    <div
                      className={cn(
                        "md:col-span-7 relative group",
                        index % 2 === 1 ? "md:order-2" : "",
                      )}
                    >
                      <motion.div
                        className="relative rounded-lg overflow-hidden"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Overlay */}
                        <motion.div
                          className="absolute inset-0 bg-[#64ffda] mix-blend-multiply z-10"
                          initial={{ opacity: 0.2 }}
                          whileHover={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Image */}
                        <div className="relative w-full h-64 md:h-80 bg-[#112240] rounded-lg flex items-center justify-center border border-[#233554]">
                          {project.imageUrl &&
                          project.imageUrl !== "placeholder" ? (
                            <img
                              src={project.imageUrl}
                              alt={project.title}
                              className="w-full h-full object-cover rounded-lg"
                              loading="lazy"
                            />
                          ) : (
                            <div className="text-center space-y-4">
                              <motion.div
                                className="w-16 h-16 mx-auto border-2 border-[#64ffda]/30 rounded-lg flex items-center justify-center"
                                animate={{
                                  borderColor: [
                                    "rgba(100, 255, 218, 0.3)",
                                    "rgba(100, 255, 218, 0.6)",
                                    "rgba(100, 255, 218, 0.3)",
                                  ],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              >
                                <Eye className="w-8 h-8 text-[#64ffda]/50" />
                              </motion.div>
                              <p className="text-[#64ffda] font-mono text-sm">
                                Project Screenshot
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Hover Links */}
                        <motion.div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <motion.a
                            href={getGithubUrl(project)}
                            className="p-2 bg-[#0a192f]/90 text-[#ccd6f6] rounded-full hover:text-[#64ffda] transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="w-5 h-5" />
                          </motion.a>
                          <motion.a
                            href={getProjectUrl(project)}
                            className="p-2 bg-[#0a192f]/90 text-[#ccd6f6] rounded-full hover:text-[#64ffda] transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </motion.a>
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Project Details */}
                    <div
                      className={cn(
                        "md:col-span-5 space-y-4",
                        index % 2 === 1 ? "md:order-1 md:text-right" : "",
                      )}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: index % 2 === 1 ? 50 : -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 + 0.3, duration: 0.6 }}
                        viewport={{ once: true }}
                      >
                        <p className="text-[#64ffda] font-mono text-sm mb-2">
                          Featured Project
                        </p>
                        <h3 className="text-2xl md:text-3xl font-bold text-[#ccd6f6] mb-4 hover:text-[#64ffda] transition-colors cursor-pointer">
                          {project.title}
                        </h3>
                      </motion.div>

                      {/* Description Card */}
                      <motion.div
                        className="bg-[#112240] backdrop-blur-sm p-6 rounded-lg shadow-xl border border-[#233554]/50 relative z-10"
                        whileHover={{
                          backgroundColor: "rgba(17, 34, 64, 0.8)",
                          borderColor: "rgba(100, 255, 218, 0.2)",
                          y: -5,
                        }}
                        transition={{ duration: 0.3 }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                      >
                        <p className="text-[#8892b0] leading-relaxed">
                          {project.description}
                        </p>
                      </motion.div>

                      {/* Technologies */}
                      <motion.div
                        className={cn(
                          "flex flex-wrap gap-2",
                          index % 2 === 1 ? "md:justify-end" : "",
                        )}
                        variants={{
                          hidden: {},
                          visible: {
                            transition: {
                              staggerChildren: 0.1,
                              delayChildren: index * 0.2 + 0.6,
                            },
                          },
                        }}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                      >
                        {formatTechnologies(project.technologies)
                          .slice(0, 5)
                          .map((tech) => (
                            <motion.span
                              key={tech}
                              className="px-3 py-1 text-[#8892b0] text-sm font-mono hover:text-[#64ffda] transition-colors cursor-default"
                              variants={{
                                hidden: { opacity: 0, scale: 0.8 },
                                visible: {
                                  opacity: 1,
                                  scale: 1,
                                  transition: {
                                    duration: 0.4,
                                    ease: "easeOut",
                                  },
                                },
                              }}
                              whileHover={{ scale: 1.05 }}
                            >
                              {tech}
                            </motion.span>
                          ))}
                      </motion.div>

                      {/* Links */}
                      <motion.div
                        className={cn(
                          "flex gap-4 pt-2",
                          index % 2 === 1 ? "md:justify-end" : "",
                        )}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: index * 0.2 + 0.8, duration: 0.6 }}
                        viewport={{ once: true }}
                      >
                        <motion.a
                          href={getGithubUrl(project)}
                          className="text-[#ccd6f6] hover:text-[#64ffda] transition-colors p-2 rounded-full hover:bg-[#64ffda]/5"
                          whileHover={{ scale: 1.2, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Github className="w-6 h-6" />
                        </motion.a>
                        <motion.a
                          href={getProjectUrl(project)}
                          className="text-[#ccd6f6] hover:text-[#64ffda] transition-colors p-2 rounded-full hover:bg-[#64ffda]/5"
                          whileHover={{ scale: 1.2, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-6 h-6" />
                        </motion.a>
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatedItem>
              ))}
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

          {/* Other Projects Grid */}
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
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.2,
                    },
                  },
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {otherProjects.map((project) => (
                  <motion.div
                    key={project.id}
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

          {/* View More Link */}
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
