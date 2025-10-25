import { Experience, NavigationSection } from "@/types";
import { Briefcase, FolderOpen, Home, Mail, User } from "lucide-react";

// ---------- Navigation Configuration ----------
export const NAVIGATION_SECTIONS: NavigationSection[] = [
  { id: "home", name: "Home", icon: Home },
  { id: "about", name: "About", icon: User },
  { id: "experience", name: "Experience", icon: Briefcase },
  { id: "work", name: "Work", icon: FolderOpen },
  { id: "contact", name: "Contact", icon: Mail },
];

// ---------- Default Content ----------
export const DEFAULT_CONTENT = {
  heroTitle: "Ali Soveizi",
  heroSubtitle: "Frontend Developer",
  heroDescription: "I build things for the web.",
  aboutText: `Hi, I’m Ali Soveizi, a Front-End Developer from Mashhad, Iran, with a Bachelor’s in Computer Engineering and currently pursuing my Master’s at Azad University of Mashhad. I build clean, responsive web experiences using React and Next.js, and I enjoy exploring new frameworks, contributing to open-source projects, and learning about design and UX. I’m open to opportunities to grow as a developer and collaborate with creative teams.`,
  contactEmail: "ali.soveizi@example.com",
  contactPhone: "+98 912 345 6789",
};

// ---------- Experience Data ----------
export const EXPERIENCE_DATA: Experience[] = [
  {
    title: "Frontend Developer",
    company: "Tech Company",
    period: "2022 - Present",
    description: `Developed and maintained web applications using React and Next.js.
      Implemented responsive designs and improved website performance.`,
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    title: "Junior Frontend Developer",
    company: "Startup Inc",
    period: "2021 - 2022",
    description: `Worked on client projects, built responsive websites, and collaborated
      with design teams to implement pixel-perfect designs.`,
    technologies: ["JavaScript", "HTML", "CSS", "React"],
  },
];

// ---------- Theme Configuration ----------
export const THEME = {
  colors: {
    primary: "#64ffda",
    secondary: "#8892b0",
    background: "#0a192f",
    backgroundLight: "#112240",
    text: "#ccd6f6",
    textSecondary: "#8892b0",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
} as const;

// ---------- API Endpoints ----------
export const API_ENDPOINTS = {
  projects: "/api/projects",
  skills: "/api/skills",
  content: "/api/content",
  experiences: "/api/experiences",
} as const;

// ---------- SEO Schema Configuration ----------
export const PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ali Soveizi",
  jobTitle: "Frontend Developer",
  description:
    "Frontend Developer specializing in React, Next.js, and modern web technologies",
  url: "https://alisoveizi.dev",
  email: "ali.soveizi@example.com",
  telephone: "+98 912 345 6789",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Tehran",
    addressCountry: "IR",
  },
  sameAs: [
    "https://github.com/alisoveizi",
    "https://linkedin.com/in/alisoveizi",
    "https://twitter.com/alisoveizi",
  ],
  knowsAbout: [
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "Tailwind CSS",
    "Frontend Development",
    "Web Development",
    "UI/UX Design",
  ],
} as const;

// ---------- SEO Configuration ----------
export const SEO_CONFIG = {
  defaultTitle: "Portfolio - Ali Soveizi",
  titleTemplate: "%s | Ali Soveizi",
  description:
    "Frontend Developer Portfolio - Building exceptional digital experiences with React, Next.js, and TypeScript",
  keywords: [
    "Frontend Developer",
    "React",
    "Next.js",
    "TypeScript",
    "Portfolio",
    "Web Development",
    "JavaScript",
    "UI/UX",
    "Tailwind CSS",
    "Framer Motion",
    "Responsive Design",
  ],
  author: "Ali Soveizi",
  siteUrl: "https://alisoveizi.dev",
  ogImage: "/og-image.jpg",
};

// ---------- Animation Configuration ----------
export const ANIMATION_CONFIG = {
  staggerDelay: 0.15,
  defaultDuration: 0.6,
  easeInOut: [0.42, 0, 0.58, 1],
} as const;

// ---------- Scroll Configuration ----------
export const SCROLL_CONFIG = {
  offset: 100, // Offset for scroll spy
  behavior: "smooth" as ScrollBehavior,
} as const;

// ---------- Contact Information ----------
export const CONTACT_INFO = {
  email: "ali.soveizi@example.com",
  phone: "+98 912 345 6789",
  location: "Tehran, Iran",
  social: {
    github: "https://github.com/alisoveizi",
    linkedin: "https://linkedin.com/in/alisoveizi",
    twitter: "https://twitter.com/alisoveizi",
  },
} as const;

// ---------- Skills Categories ----------
export const SKILL_CATEGORIES = {
  frontend: "Frontend",
  backend: "Backend",
  tools: "Tools & Technologies",
  design: "Design",
} as const;

// ---------- Project Categories ----------
export const PROJECT_CATEGORIES = {
  web: "Web Application",
  mobile: "Mobile App",
  desktop: "Desktop App",
  library: "Library/Package",
} as const;
