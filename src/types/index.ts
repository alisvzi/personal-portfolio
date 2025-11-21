export interface Project {
  _id: string;
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
  _id: string;
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
  contactPhone: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  aboutText: string;
  contactEmail: string;
}

export interface ContentDocument extends Content, Document {}

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

export interface PortfolioData2 {
  projects: { projects: Project[] };
  skills: { skills: Skill[] };
  experiences: { experiences: Experience[] };
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
