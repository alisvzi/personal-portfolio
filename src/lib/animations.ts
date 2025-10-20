import { Variants } from "framer-motion";

// ---------- Animation Variants ----------
export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.42, 0, 0.58, 1] },
  },
};

export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

export const rotateFade: Variants = {
  hidden: { opacity: 0, rotate: -10 },
  visible: {
    opacity: 1,
    rotate: 0,
    transition: { duration: 0.7, ease: "easeInOut" },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export const slideLeftFade: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.42, 0, 0.58, 1] },
  },
};

export const slideRightFade: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.42, 0, 0.58, 1] },
  },
};

export const waveBounce: Variants = {
  hidden: { y: 0 },
  visible: {
    y: [0, -10, 0],
    transition: { repeat: Infinity, repeatType: "loop", duration: 0.6 },
  },
};

export const scaleHover: Variants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

export const slideInLeft: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const slideInRight: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

export const cardHover: Variants = {
  hover: {
    y: -5,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    transition: { duration: 0.3 },
  },
};

// ---------- Animation Presets ----------
export const defaultTransition = {
  duration: 0.6,
  ease: [0.42, 0, 0.58, 1],
};

export const springTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
};

export const quickTransition = {
  duration: 0.3,
  ease: "easeInOut",
};

// ---------- Viewport Settings ----------
export const defaultViewport = {
  once: false,
  amount: 0.3,
};

export const viewportOnce = {
  once: true,
  amount: 0.3,
};
