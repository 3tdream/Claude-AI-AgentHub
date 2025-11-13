import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SlideProps {
  children: ReactNode;
  background?: string;
  overlay?: boolean;
}

// Enhanced slide transition variants
const slideVariants = {
  enter: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  center: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
  },
};

// Background image animation variants - Ken Burns effect with subtle zoom and pan
const backgroundVariants = {
  enter: {
    opacity: 0,
    scale: 1.1,
  },
  center: {
    opacity: 1,
    scale: 1.05,
    transition: {
      opacity: { duration: 0.8, ease: "easeOut" },
      scale: { duration: 20, ease: "linear" }, // Slow Ken Burns zoom
    },
  },
  exit: {
    opacity: 0,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
};

// Gradient background animation for non-image backgrounds
const gradientVariants = {
  enter: {
    opacity: 0,
  },
  center: {
    opacity: 1,
    transition: {
      duration: 1,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function Slide({ children, background, overlay = false }: SlideProps) {
  const isGradient = background?.startsWith("linear-gradient") || background?.startsWith("radial-gradient");

  return (
    <motion.div
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="w-full h-screen flex items-center justify-center relative overflow-hidden"
    >
      {/* Animated Background Layer */}
      {background && (
        <motion.div
          key={background} // Re-animate when background changes
          variants={isGradient ? gradientVariants : backgroundVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${background})`,
            background: isGradient ? background : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            willChange: "transform, opacity", // Performance optimization
          }}
        />
      )}

      {/* Animated Overlay */}
      {overlay && (
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-8 md:p-16">
        {children}
      </div>
    </motion.div>
  );
}
