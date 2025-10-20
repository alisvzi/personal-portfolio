"use client";

import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { ReactNode, ElementType } from "react";
import { cn } from "@/lib/utils";
import {
  defaultViewport,
  fadeScale,
  fadeSlideUp,
  slideLeftFade,
  slideRightFade,
  staggerContainer,
} from "@/lib/animations";

interface AnimatedContainerProps
  extends Omit<HTMLMotionProps<"div">, "variants" | "transition"> {
  children: ReactNode;
  variant?:
    | "fadeSlideUp"
    | "fadeScale"
    | "slideLeft"
    | "slideRight"
    | "stagger";
  delay?: number;
  duration?: number;
  staggerChildren?: number;
  className?: string;
  viewport?: {
    once?: boolean;
    amount?: number;
  };
}

const variantsMap: Record<
  "fadeSlideUp" | "fadeScale" | "slideLeft" | "slideRight" | "stagger",
  Variants
> = {
  fadeSlideUp,
  fadeScale,
  slideLeft: slideLeftFade,
  slideRight: slideRightFade,
  stagger: staggerContainer,
};

export function AnimatedContainer({
  children,
  variant = "fadeSlideUp",
  delay = 0,
  duration,
  staggerChildren,
  className,
  viewport = defaultViewport,
  ...props
}: AnimatedContainerProps) {
  const baseVariant = variantsMap[variant];

  // فقط variant را بده، transition را به motion.div بدهیم
  const transitionProps = {
    ...(duration && { duration }),
    ...(delay && { delay }),
    ...(staggerChildren && { staggerChildren }),
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={baseVariant}
      transition={transitionProps} // ✅ اینجا کاملاً تایپ صحیح است
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// AnimatedItem
interface AnimatedItemProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  children: ReactNode;
  variant?: "fadeSlideUp" | "fadeScale" | "slideLeft" | "slideRight";
  className?: string;
}

export function AnimatedItem({
  children,
  variant = "fadeSlideUp",
  className,
  ...props
}: AnimatedItemProps) {
  return (
    <motion.div
      variants={variantsMap[variant]}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// AnimatedText
interface AnimatedTextProps extends Omit<HTMLMotionProps<"span">, "variants"> {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  splitBy?: "word" | "char";
}

export function AnimatedText({
  text,
  className,
  as: Component = "span",
  splitBy = "word",
  ...props
}: AnimatedTextProps) {
  const MotionComponent = motion[
    Component as keyof typeof motion
  ] as ElementType<HTMLMotionProps<typeof Component>>;

  const words = splitBy === "word" ? text.split(" ") : text.split("");

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: splitBy === "word" ? 0.12 : 0.03,
        delayChildren: 0.04,
      },
    },
  };

  const child: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] },
    },
  };

  return (
    <MotionComponent
      className={cn(className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      {...props}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block"
          style={{ marginRight: splitBy === "word" ? "0.25em" : "0" }}
        >
          {word}
          {splitBy === "char" && word === " " && "\u00A0"}
        </motion.span>
      ))}
    </MotionComponent>
  );
}

// ScrollReveal
interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  delay?: number;
  duration?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  direction = "up",
  distance = 50,
  delay = 0,
  duration = 0.8,
  className,
}: ScrollRevealProps) {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        transition: { duration, delay, ease: [0.42, 0, 0.58, 1] },
      }}
      viewport={{ once: true, amount: 0.3 }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
