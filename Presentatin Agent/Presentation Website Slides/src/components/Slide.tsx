import { motion } from "motion/react";
import { ReactNode } from "react";

interface SlideProps {
  children: ReactNode;
  background?: string;
  overlay?: boolean;
}

export function Slide({ children, background, overlay = false }: SlideProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="w-full h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: background ? `url(${background})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {overlay && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      )}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-8 md:p-16">
        {children}
      </div>
    </motion.div>
  );
}
