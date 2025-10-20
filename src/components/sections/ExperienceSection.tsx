import { motion } from "framer-motion";
import { Experience } from "@/types";
import {
  AnimatedContainer,
  AnimatedItem,
} from "@/components/ui/AnimatedContainer";
import { cn } from "@/lib/utils";
import { EXPERIENCE_DATA } from "@/lib/constants";

interface ExperienceSectionProps {
  experience?: Experience[];
  className?: string;
}

export function ExperienceSection({
  experience = EXPERIENCE_DATA,
  className,
}: ExperienceSectionProps) {
  return (
    <section
      id="experience"
      className={cn(
        "min-h-screen py-20 flex items-center",
        "relative overflow-hidden",
        className,
      )}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[#64ffda]/3 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <AnimatedContainer
          variant="slideRight"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-12"
        >
          {/* Section Title */}
          <AnimatedItem>
            <div className="flex items-center mb-12">
              <motion.span
                className="text-[#64ffda] font-mono text-lg mr-4"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                02.
              </motion.span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#ccd6f6]">
                Where I&apos;ve Worked
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

          {/* Experience Timeline */}
          <div className="space-y-12">
            {experience.map((job, index) => (
              <AnimatedItem
                key={index}
                variant="fadeSlideUp"
                className="relative"
              >
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  {/* Timeline Line */}
                  {index < experience.length - 1 && (
                    <motion.div
                      className="absolute left-0 top-16 w-px h-24 bg-gradient-to-b from-[#64ffda]/50 to-[#64ffda]/20 hidden md:block"
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      transition={{ delay: index * 0.2 + 0.5, duration: 0.6 }}
                      viewport={{ once: true }}
                    />
                  )}

                  {/* Timeline Dot */}
                  <motion.div
                    className="absolute left-0 top-6 w-3 h-3 bg-[#64ffda] rounded-full border-4 border-[#0a192f] hidden md:block"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: index * 0.2 + 0.3, duration: 0.4 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.5 }}
                  />

                  {/* Job Content */}
                  <div className="md:ml-8 space-y-4">
                    {/* Job Header */}
                    <div className="space-y-2">
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <h3 className="text-xl md:text-2xl font-semibold text-[#ccd6f6]">
                          {job.title}
                        </h3>
                        <motion.span
                          className="text-[#64ffda] font-mono text-base md:text-lg"
                          whileHover={{ scale: 1.05 }}
                        >
                          @ {job.company}
                        </motion.span>
                      </div>
                      <p className="text-[#8892b0] font-mono text-sm">
                        {job.period}
                      </p>
                    </div>

                    {/* Job Description */}
                    <motion.div
                      className="bg-[#112240]/50 backdrop-blur-sm p-6 rounded-lg border border-[#233554]/50"
                      whileHover={{
                        backgroundColor: "rgba(17, 34, 64, 0.8)",
                        borderColor: "rgba(100, 255, 218, 0.2)",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-[#8892b0] leading-relaxed text-base">
                        {job.description}
                      </p>
                    </motion.div>

                    {/* Technologies */}
                    <motion.div
                      className="flex flex-wrap gap-2"
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
                      {job.technologies.map((tech) => (
                        <motion.span
                          key={tech}
                          className="px-3 py-1 bg-[#64ffda]/10 text-[#64ffda] text-sm font-mono rounded-full border border-[#64ffda]/20 hover:bg-[#64ffda]/20 transition-colors cursor-default"
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
                          whileHover={{
                            scale: 1.1,
                            backgroundColor: "rgba(100, 255, 218, 0.2)",
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </motion.div>

                    {/* Achievements/Highlights (if any) */}
                    <motion.div
                      className="pt-2"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: index * 0.2 + 0.8, duration: 0.6 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-start space-x-2">
                        <motion.div
                          className="w-1 h-1 bg-[#64ffda] rounded-full mt-3 flex-shrink-0"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        <p className="text-[#8892b0] text-sm italic">
                          Key contributions and achievements during this role
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatedItem>
            ))}
          </div>

          {/* Call to Action */}
          <AnimatedItem variant="fadeSlideUp" className="text-center pt-12">
            <motion.div
              className="inline-flex items-center space-x-2 text-[#8892b0] hover:text-[#64ffda] transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="font-mono text-sm">View Full Resume</span>
              <motion.svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </motion.svg>
            </motion.div>
          </AnimatedItem>
        </AnimatedContainer>
      </div>
    </section>
  );
}

export default ExperienceSection;
