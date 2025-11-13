"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "white";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-3",
  xl: "w-16 h-16 border-4",
};

const colorClasses = {
  primary: "border-[#64ffda] border-t-transparent",
  secondary: "border-[#8892b0] border-t-transparent",
  white: "border-white border-t-transparent",
};

export function LoadingSpinner({
  size = "md",
  color = "primary",
  className,
}: LoadingSpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        ease: "linear",
      }}
      className={cn(
        "rounded-full",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}

interface FullScreenLoadingProps {
  message?: string;
}

export function FullScreenLoading({
  message = "Loading...",
}: FullScreenLoadingProps) {
  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col items-center justify-center">
      <LoadingSpinner size="xl" />
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-[#8892b0] mt-4 font-mono text-sm"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
          className="w-2 h-2 bg-[#64ffda] rounded-full"
        />
      ))}
    </div>
  );
}
