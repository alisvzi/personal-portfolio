export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  githubUrl: string;
  projectUrl: string;
  technologies: string;
  featured?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
  level?: number;
}

export interface Experience {
  id?: string;
  title: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
}

export interface Content {
  heroBadge: string;
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
