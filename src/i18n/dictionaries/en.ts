/**
 * English dictionary.
 *
 * This file is the structural source of truth: `Dictionary` is derived from it
 * and every other locale must `satisfies Dictionary`, so a missing or renamed
 * key is a compile-time error rather than a blank string at runtime.
 *
 * Placeholders use `{name}` and are rendered with `interpolate()` from
 * `@/i18n`. Dictionaries contain only serialisable values (no functions) so a
 * slice can be passed from a Server Component to a Client Component.
 *
 * Server Actions never return user-facing sentences: they return a key from
 * `admin.errors` (or `login.errors`) plus optional `{placeholder}` values, and
 * the panel renders it in the language the admin is using.
 */

const en = {
  meta: {
    siteName: "Ali Soveizi",
    role: "Front-End Developer",
    homeTitle: "Ali Soveizi — Front-End Developer",
    homeDescription:
      "Portfolio of Ali Soveizi, a front-end developer building fast, accessible web interfaces with React, Next.js and TypeScript.",
    keywords: [
      "Ali Soveizi",
      "front-end developer",
      "React developer",
      "Next.js developer",
      "TypeScript",
      "web development",
      "portfolio",
    ],
    ogImageAlt: "Ali Soveizi — Front-End Developer",
    adminTitle: "Admin dashboard",
    loginTitle: "Sign in",
  },

  language: {
    label: "Language",
    switchTo: "Switch to {language}",
  },

  nav: {
    label: "Section navigation",
    home: "Home",
    about: "About",
    experience: "Experience",
    work: "Work",
    contact: "Contact",
    navigateTo: "Go to the {section} section",
  },

  hero: {
    greeting: "Hi, my name is",
    getInTouch: "Get in touch",
    downloadResume: "Download résumé",
    scroll: "Scroll to explore",
  },

  about: {
    heading: "About me",
    paragraph2:
      "I care about the details that make an interface feel effortless: clear hierarchy, accessible interaction, and performance that holds up on a slow connection. Away from the keyboard I read about design, contribute to open-source projects, and pick up whatever I can bring back to my work.",
    skillsTitle: "Tools I work with",
    skillsSubtitle:
      "Taken straight from my skills list — the stack I reach for when a project has to ship.",
    skillCategories: {
      frontend: "Front-end",
      backend: "Back-end",
      database: "Data",
      devops: "DevOps",
      mobile: "Mobile",
      design: "Design",
      other: "Also",
    },
    availabilityFreelance: "Available for freelance work",
    availabilityCollaboration: "Open to collaborations",
    photoAlt: "Portrait of {name}",
  },

  experience: {
    heading: "Where I have worked",
    empty: "No work experience has been added yet.",
    at: "at {company}",
  },

  work: {
    heading: "Some things I have built",
    featured: "Featured project",
    otherHeading: "Other projects",
    otherDescription: "A selection of other projects I have worked on",
    emptyTitle: "Projects coming soon",
    emptyDescription:
      "I am currently working on a few new projects. Check back soon to see what I have been building.",
    repository: "Source code for {title}",
    liveSite: "Live site for {title}",
    caseStudy: "Case study",
    viewProject: "Open the {title} case study",
  },

  project: {
    backToWork: "All work",
    navigation: "Project navigation",
    overview: "Overview",
    details: "Project details",
    role: "Role",
    year: "Year",
    client: "Client",
    stack: "Stack",
    gallery: "Gallery",
    galleryEmpty: "No screenshots have been added for this project yet.",
    imageAlt: "{title} — screenshot {index}",
    liveSite: "Visit the live site",
    sourceCode: "View the source code",
    previous: "Previous project",
    next: "Next project",
    notFound: "This project does not exist or has been removed.",
  },

  contact: {
    heading: "Get in touch",
    title: "Let us work together",
    description:
      "I am always happy to hear about new opportunities — a full-time role, contract work, or just a conversation about technology.",
    connectHeading: "Let us connect",
    emailLabel: "Email",
    phoneLabel: "Phone",
    locationLabel: "Location",
    location: "Mashhad, Iran",
    followHeading: "Follow me",
    resumePrompt: "Looking for my résumé?",
    downloadResume: "Download résumé",
    form: {
      name: "Name",
      namePlaceholder: "Your name",
      email: "Email",
      emailPlaceholder: "you@example.com",
      subject: "Subject",
      subjectPlaceholder: "What is this about?",
      message: "Message",
      messagePlaceholder: "Tell me about your project, or just say hello.",
      submit: "Send message",
      submitting: "Sending…",
      successTitle: "Message sent",
      successBody:
        "Thanks for getting in touch. I will get back to you as soon as I can.",
      sendAnother: "Send another message",
    },
    errors: {
      nameRequired: "Please enter your name.",
      emailRequired: "Please enter your email address.",
      emailInvalid: "Please enter a valid email address.",
      subjectRequired: "Please enter a subject.",
      messageRequired: "Please enter a message.",
      sendFailed: "Your message could not be sent. Please try again.",
    },
  },

  states: {
    loading: "Loading…",
    loadingPortfolio: "Loading portfolio…",
    errorTitle: "Something went wrong",
    errorBody:
      "This page could not be loaded. Please try again — if the problem continues, come back a little later.",
    retry: "Try again",
    notFoundTitle: "Page not found",
    notFoundBody: "The page you are looking for does not exist or has moved.",
    backHome: "Back to home",
  },

  login: {
    title: "Admin sign in",
    subtitle: "Sign in to manage the portfolio content.",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    submitting: "Signing in…",
    errors: {
      emailPasswordRequired: "Email and password are required.",
      tooManyAttempts: "Too many attempts. Please try again in {seconds} seconds.",
      invalidCredentials: "Incorrect email or password.",
      unavailable: "Sign-in is temporarily unavailable.",
    },
  },

  admin: {
    title: "Admin dashboard",
    logout: "Sign out",
    tabs: {
      projects: "Projects",
      skills: "Skills",
      experiences: "Experience",
      content: "Content",
      messages: "Messages",
    },
    actions: {
      add: "Add",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      saving: "Saving…",
      cancel: "Cancel",
      markAsRead: "Mark as read",
    },
    errors: {
      loadFailed: "Could not load this data.",
      saveFailed: "Could not save your changes.",
      deleteFailed: "Could not delete this item.",
      unexpected: "Something went wrong. Please try again.",
      unauthorized: "You must be signed in as an admin to do that.",
      idRequired: "An id is required.",
      notFound: "That item no longer exists.",
      titleRequired: "A title is required.",
      titleTooLong: "That title is too long.",
      descriptionRequired: "A description is required.",
      descriptionTooLong: "That description is too long.",
      technologiesRequired: "At least one technology is required.",
      projectUrlInvalid: "The project URL must be a valid http(s) address.",
      githubUrlInvalid: "The GitHub URL must be a valid http(s) address.",
      imageEmpty: "The uploaded file is empty.",
      imageTooLarge: "Images must be smaller than {megabytes} MB.",
      imageUnsupported: "Unsupported image type. Use JPEG, PNG, WebP or AVIF.",
      imageUnreadable:
        "That file could not be read as an image. Please upload a JPEG, PNG, WebP or AVIF file.",
      nameRequired: "A skill name is required.",
      nameTooLong: "That skill name is too long.",
      nameFaTooLong: "The Persian name is too long.",
      categoryTooLong: "That category is too long.",
      experienceFieldsRequired:
        "Role, company, dates, description and technologies are all required.",
      roleCompanyTooLong: "The role or company name is too long.",
      periodTooLong: "The date range is too long.",
      unknownField: "Unknown content field.",
      valueRequired: "A value is required.",
      valueTooLong: "That value is too long.",
      emailInvalid: "Enter a valid email address.",
      slugInvalid:
        "The slug may only contain lowercase Latin letters, numbers and single dashes.",
      yearInvalid: "The year must be four digits, for example 2024.",
      galleryTooMany: "You can attach at most {max} gallery images.",
    },
    confirm: {
      deleteProject: "Delete this project? This cannot be undone.",
      deleteSkill: "Delete this skill? This cannot be undone.",
      deleteExperience: "Delete this experience? This cannot be undone.",
      deleteMessage: "Delete this message? This cannot be undone.",
    },
    projects: {
      heading: "Projects",
      addTitle: "Add project",
      editTitle: "Edit project",
      loading: "Loading projects…",
      saveLabel: "Save project",
      title: "Title",
      titleFa: "Title (Persian)",
      slug: "URL slug",
      slugHint:
        "Leave empty to build it from the title. Lowercase Latin letters, numbers and dashes.",
      description: "Short description",
      descriptionFa: "Short description (Persian)",
      longDescription: "Case study",
      longDescriptionFa: "Case study (Persian)",
      longDescriptionHint:
        "One paragraph per blank line. Shown on the project page.",
      role: "Your role",
      year: "Year",
      client: "Client",
      coverImage: "Cover image",
      image: "Image",
      imageHint: "JPEG, PNG, WebP or AVIF, up to 8 MB.",
      gallery: "Gallery images",
      galleryHint:
        "JPEG, PNG, WebP or AVIF, up to 8 MB each and 8 images in total.",
      galleryExisting: "Current gallery",
      galleryRemove: "Remove",
      galleryEmpty: "No gallery images yet.",
      projectUrl: "Live URL",
      githubUrl: "Source URL",
      technologies: "Technologies (comma separated)",
      featured: "Featured project",
      order: "Display order",
      featuredBadge: "Featured",
      orderLabel: "Order: {order}",
      empty: "No projects yet. Add your first project to get started.",
    },
    skills: {
      heading: "Skills",
      toolboxHint:
        "These are exactly the skills shown in the “Tools I work with” card on the home page. Category picks the group, display order sets the position, and level draws the small bar under each skill.",
      addTitle: "Add skill",
      editTitle: "Edit skill",
      loading: "Loading skills…",
      saveLabel: "Save skill",
      name: "Name",
      nameFa: "Name (Persian)",
      category: "Category",
      level: "Level",
      levelLabel: "Skill level: {level}%",
      selectCategory: "Select category",
      icon: "Icon",
      order: "Display order",
      orderLabel: "Order: {order}",
      empty: "No skills yet.",
    },
    experiences: {
      heading: "Experience",
      addTitle: "Add experience",
      editTitle: "Edit experience",
      loading: "Loading experience…",
      saveLabel: "Save experience",
      title: "Job title",
      company: "Company",
      period: "Period",
      description: "Description",
      technologies: "Technologies (comma separated)",
      order: "Display order",
      orderLabel: "Order: {order}",
      empty: "No experience entries yet.",
    },
    content: {
      heading: "Site content",
      loading: "Loading content…",
      persianSuffix: "(Persian)",
      heroTitle: "Main title",
      heroSubtitle: "Subtitle",
      heroDescription: "Short description",
      aboutText: "About text",
      contactEmail: "Contact email",
      contactPhone: "Contact phone",
    },
    messages: {
      heading: "Messages",
      loading: "Loading messages…",
      total: "Total: {count}",
      unread: "Unread: {count}",
      empty: "No messages yet.",
      newBadge: "New",
    },
  },
};

export default en;

export type Dictionary = typeof en;
