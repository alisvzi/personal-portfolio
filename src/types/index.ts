export interface Project {
  id: string;
  title: string;
  titleFa?: string;
  description: string;
  descriptionFa?: string;
  imageUrl: string;
  imagePlaceholderUrl: string;
  githubUrl: string;
  projectUrl: string;
  technologies: string;
  featured?: boolean;
  order?: number;
}

export interface Skill {
  id: string;
  name: string;
  nameFa?: string;
  category?: string;
  level?: number;
  icon?: string;
  order?: number;
}

export interface Experience {
  id?: string;
  title: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
  order?: number;
}

export interface Content {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
}

export interface NavigationSection {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface PortfolioData {
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
  content: Content;
}

export interface AnimationVariants {
  hidden: Record<string, unknown>;
  visible: Record<string, unknown>;
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}
