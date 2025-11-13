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

export function Slide({ children, background, overlay = false }: SlideProps) {
  return (
    <motion.div
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1], // Custom easing for smoother feel
      }}
      className="w-full h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: background ? `url(${background})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {overlay && (
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
      )}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-8 md:p-16">
        {children}
      </div>
    </motion.div>
  );
}
