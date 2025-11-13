"use client";
import {
  AnimatedContainer,
  AnimatedItem,
} from "@/components/ui/AnimatedContainer";
import { cn } from "@/lib/utils";
import { Content, Skill } from "@/types";
import { motion } from "framer-motion";
import { Triangle } from "lucide-react";
import Image from "next/image";
import ImageProfile from "public/ptf.jpg";

interface AboutSectionProps {
  content: Content;
  skills: Skill[];
  className?: string;
}

export function AboutSection({
  content,
  skills,
  className,
}: AboutSectionProps) {
  const displayedSkills = skills.slice(0, 6);

  return (
    <section
      id="about"
      className={cn(
        "min-h-screen py-20 flex items-center",
        "relative overflow-hidden",
        className
      )}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/3 -right-32 w-64 h-64 rounded-full bg-[#64ffda]/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content Side */}
          <AnimatedContainer
            variant="slideRight"
            className="space-y-6"
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Section Title */}
            <AnimatedItem>
              <div className="flex items-center mb-8">
                <motion.span
                  className="text-[#64ffda] font-mono text-lg mr-4"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  01.
                </motion.span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#ccd6f6]">
                  About Me
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

            {/* About Text */}
            <AnimatedItem variant="fadeSlideUp">
              <div className="space-y-4 text-[#8892b0] leading-relaxed">
                <p className="text-base md:text-lg">{content.aboutText}</p>
                <p className="text-base md:text-lg">
                  I&apos;m passionate about creating seamless user experiences
                  and staying up-to-date with the latest web technologies. When
                  I&apos;m not coding, not coding, you can find me exploring new
                  frameworks, contributing to open-source projects, or sharing
                  knowledge with the developer community.
                </p>
              </div>
            </AnimatedItem>

            {/* Skills Section */}
            <AnimatedItem variant="fadeSlideUp">
              <div className="space-y-4">
                <p className="text-[#8892b0] text-base md:text-lg">
                  Here are a few technologies I&apos;ve been working with
                  recently:
                </p>

                {displayedSkills.length > 0 ? (
                  <motion.ul
                    className="grid grid-cols-2 gap-2"
                    variants={{
                      hidden: {},
                      visible: {
                        transition: {
                          staggerChildren: 0.1,
                          delayChildren: 0.3,
                        },
                      },
                    }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                  >
                    {displayedSkills.map((skill) => (
                      <motion.li
                        key={skill._id}
                        className="flex flex-col gap-3 text-[#8892b0] text-sm md:text-base group"
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          visible: {
                            opacity: 1,
                            x: 0,
                            transition: {
                              duration: 0.5,
                              ease: "easeOut",
                            },
                          },
                        }}
                        whileHover={{
                          x: 5,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <div className="flex items-center">
                          <motion.span
                            className="text-[#64ffda] mr-3 text-sm"
                            animate={{
                              rotate: [0, 180, 360],
                            }}
                            transition={{
                              duration: 2,
                              repeatDelay: 3,
                              ease: "easeInOut",
                            }}
                          >
                            <Triangle className="rotate-90 fill-[#64ffda] h-5" />
                          </motion.span>
                          <span className="group-hover:text-[#64ffda] transition-colors duration-200">
                            {skill.name}
                          </span>
                        </div>

                        <div className="w-full bg-[#233554] rounded-full h-2">
                          <motion.div
                            className="bg-[#64ffda] h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.level}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "JavaScript",
                      "TypeScript",
                      "React",
                      "Next.js",
                      "Node.js",
                      "Python",
                    ].map((tech) => (
                      <motion.div
                        key={tech}
                        className="flex items-center text-[#8892b0] text-sm md:text-base"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: Math.random() * 0.5,
                          duration: 0.5,
                        }}
                        viewport={{ once: true }}
                      >
                        <span className="text-[#64ffda] mr-3 text-sm">▶</span>
                        {tech}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </AnimatedItem>

            {/* Additional Info */}
            <AnimatedItem variant="fadeSlideUp">
              <motion.div
                className="flex flex-wrap gap-4 pt-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center text-[#8892b0] text-sm">
                  <div className="w-2 h-2 bg-[#64ffda] rounded-full mr-2 animate-pulse" />
                  Available for freelance
                </div>
                <div className="flex items-center text-[#8892b0] text-sm">
                  <div className="w-2 h-2 bg-[#64ffda] rounded-full mr-2 animate-pulse" />
                  Open to collaborations
                </div>
              </motion.div>
            </AnimatedItem>
          </AnimatedContainer>

          {/* Image Side */}
          <AnimatedContainer
            variant="fadeScale"
            className="hidden md:flex justify-center md:justify-end"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="relative group">
              {/* Main Image Container */}
              <motion.div
                className="relative w-72 h-72 lg:w-80 lg:h-80"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {/* Background Overlay */}
                <motion.div
                  className="absolute inset-0 bg-[#64ffda] rounded-lg"
                  initial={{ opacity: 0.2 }}
                  whileHover={{ opacity: 0.1 }}
                  transition={{ duration: 0.3 }}
                />
                {/* IMAGE */}

                {/* Image Placeholder */}

                <div className="absolute inset-4 bg-gradient-to-br from-[#64ffda]/20 to-[#64ffda]/5 rounded-lg border border-[#64ffda]/20 flex items-center justify-center group-hover:border-[#64ffda]/40 transition-colors duration-300 overflow-hidden">
                  <div className="text-center space-y-2">
                    <motion.div
                      className="w-16 h-16 mx-auto border-2 border-[#64ffda]/50 rounded-full flex items-center justify-center"
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 20,
                        ease: "linear",
                      }}
                    >
                      <div className="w-8 h-8 bg-[#64ffda]/30 rounded-full" />
                    </motion.div>
                    <Image
                      alt="profile"
                      src={ImageProfile}
                      fill
                      className="object-cover"
                      placeholder="blur"
                    />

                    <p className="text-[#64ffda] font-mono text-sm">
                      Your Photo Here
                    </p>
                  </div>
                </div>

                {/* Hover Border Effect */}
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-[#64ffda]/20 via-transparent to-[#64ffda]/20 rounded-lg opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
              </motion.div>

              {/* Decorative Elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 border-2 border-[#64ffda]/20 rounded-lg -z-10"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 6,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#64ffda]/10 rounded-full -z-10"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                }}
              />
            </div>
          </AnimatedContainer>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
