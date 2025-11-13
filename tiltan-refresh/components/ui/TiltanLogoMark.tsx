"use client";

import React from "react";
import { motion } from "framer-motion";

interface TiltanLogoMarkProps {
  size?: number;
  animated?: boolean;
  className?: string;
  variant?: "default" | "minimal" | "geometric";
}

const TiltanLogoMark: React.FC<TiltanLogoMarkProps> = ({
  size = 40,
  animated = true,
  className = "",
  variant = "default"
}) => {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "backOut" },
    },
  };

  const rotateVariants = {
    animate: {
      rotate: [0, 360],
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  // Geometric variant - inspired by Alche's angular style
  if (variant === "geometric") {
    return (
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        initial={animated ? "hidden" : "visible"}
        animate="visible"
        variants={containerVariants}
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#22c55e" }} />
            <stop offset="100%" style={{ stopColor: "#16a34a" }} />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#22c55e" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* Rotating background ring */}
        {animated && (
          <motion.circle
            cx="60"
            cy="60"
            r="50"
            stroke="url(#grad1)"
            strokeWidth="1"
            fill="none"
            opacity="0.2"
            variants={rotateVariants}
            animate="animate"
            strokeDasharray="4 4"
          />
        )}

        {/* Main geometric T shape with angular design */}
        <motion.g variants={containerVariants}>
          {/* Top bar - stylized with angles */}
          <motion.path
            d="M 30 35 L 90 35 L 88 45 L 32 45 Z"
            fill="url(#grad1)"
            variants={itemVariants}
            filter="url(#shadow)"
          />

          {/* Vertical stem - angular edges */}
          <motion.path
            d="M 52 35 L 68 35 L 68 90 L 60 95 L 52 90 Z"
            fill="url(#grad1)"
            variants={itemVariants}
            filter="url(#shadow)"
          />

          {/* Left decorative element */}
          <motion.polygon
            points="35,60 45,55 45,65"
            fill="url(#grad1)"
            opacity="0.8"
            variants={itemVariants}
          />

          {/* Right decorative element */}
          <motion.polygon
            points="85,60 75,55 75,65"
            fill="url(#grad1)"
            opacity="0.8"
            variants={itemVariants}
          />

          {/* Center accent diamond */}
          <motion.polygon
            points="60,52 64,56 60,60 56,56"
            fill="#fff"
            opacity="0.3"
            variants={itemVariants}
          />
        </motion.g>
      </motion.svg>
    );
  }

  // Minimal variant
  if (variant === "minimal") {
    return (
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        initial={animated ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.path
          d="M 20 25 L 80 25 L 80 30 L 53 30 L 53 75 L 47 75 L 47 30 L 20 30 Z"
          stroke="#22c55e"
          strokeWidth="2"
          fill="none"
          initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </motion.svg>
    );
  }

  // Default variant
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={animated ? "hidden" : "visible"}
      animate="visible"
      variants={containerVariants}
    >
      <defs>
        <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#22c55e" }} />
          <stop offset="100%" style={{ stopColor: "#10b981" }} />
        </linearGradient>
      </defs>

      <motion.g variants={containerVariants}>
        {/* Simple T shape */}
        <motion.rect
          x="25"
          y="30"
          width="50"
          height="8"
          fill="url(#defaultGrad)"
          variants={itemVariants}
          rx="2"
        />
        <motion.rect
          x="46"
          y="30"
          width="8"
          height="45"
          fill="url(#defaultGrad)"
          variants={itemVariants}
          rx="2"
        />
      </motion.g>
    </motion.svg>
  );
};

export default TiltanLogoMark;
