import {
  base64ToUint8Array,
  cn,
  formatTechnologies,
  getGithubUrl,
  getProjectUrl,
} from "@/lib/utils";
import { Project } from "@/types";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import { thumbHashToDataURL } from "thumbhash";
import { AnimatedItem } from "../ui/AnimatedContainer";

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const placeholderURL = project.imagePlaceholderUrl
    ? thumbHashToDataURL(base64ToUint8Array(project.imagePlaceholderUrl))
    : undefined;

  return (
    <AnimatedItem variant="fadeSlideUp" className="relative">
      <motion.div
        className="grid md:grid-cols-12 gap-8 items-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.2, duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div
          className={cn(
            "md:col-span-7 relative group",
            index % 2 === 1 ? "md:order-2" : ""
          )}
        >
          <motion.div
            className="relative rounded-lg overflow-hidden"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 bg-[#64ffda] mix-blend-multiply z-10"
              initial={{ opacity: 0.2 }}
              whileHover={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            <div className="relative w-full h-64 md:h-80 bg-[#112240] rounded-lg flex items-center justify-center border border-[#233554]">
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="w-full h-full object-cover rounded-lg"
                placeholder={placeholderURL ? "blur" : "empty"}
                blurDataURL={placeholderURL || undefined}
              />
            </div>
            <motion.div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <motion.a
                href={getGithubUrl(project)}
                className="p-2 bg-[#0a192f]/90 text-[#ccd6f6] rounded-full hover:text-[#64ffda] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                target="_blank"
                aria-label="Github"
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
                aria-label="ProjectUrl"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-5 h-5" />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
        <div
          className={cn(
            "md:col-span-5 space-y-4",
            index % 2 === 1 ? "md:order-1 md:text-right" : ""
          )}
        >
          <motion.div
            initial={{
              opacity: 0,
              x: index % 2 === 1 ? 50 : -50,
            }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{
              delay: index * 0.2 + 0.3,
              duration: 0.6,
            }}
            viewport={{ once: true }}
          >
            <p className="text-[#64ffda] font-mono text-sm mb-2">
              Featured Project
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-[#ccd6f6] mb-4 hover:text-[#64ffda] transition-colors cursor-pointer">
              {project.title}
            </h3>
          </motion.div>
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
          <motion.div
            className={cn(
              "flex flex-wrap gap-2",
              index % 2 === 1 ? "md:justify-end" : ""
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
          <motion.div
            className={cn(
              "flex gap-4 pt-2",
              index % 2 === 1 ? "md:justify-end" : ""
            )}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{
              delay: index * 0.2 + 0.8,
              duration: 0.6,
            }}
            viewport={{ once: true }}
          >
            <motion.a
              href={getGithubUrl(project)}
              className="text-[#ccd6f6] hover:text-[#64ffda] transition-colors p-2 rounded-full hover:bg-[#64ffda]/5"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
              target="_blank"
              aria-label="Github"
              rel="noopener noreferrer"
            >
              <Github className="w-6 h-6" />
            </motion.a>
            <motion.a
              href={getProjectUrl(project)}
              aria-label="ProjectUrl"
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
  );
};

export default ProjectCard;
