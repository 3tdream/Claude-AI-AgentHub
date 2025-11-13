"use client";

import React from "react";
import { motion } from "framer-motion";

interface TiltanLogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

const TiltanLogo: React.FC<TiltanLogoProps> = ({
  size = 40,
  animated = true,
  className = ""
}) => {
  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          duration: 1.5,
          ease: "easeInOut",
        },
        opacity: {
          duration: 0.3,
        },
      },
    },
  };

  const shapeVariants = {
    hidden: {
      scale: 0.8,
      opacity: 0,
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const glowVariants = {
    initial: {
      opacity: 0.5,
    },
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

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
    >
      {/* Glow effect */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#22c55e", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#10b981", stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Background glow circle */}
      {animated && (
        <motion.circle
          cx="50"
          cy="50"
          r="35"
          fill="url(#logoGradient)"
          opacity="0.1"
          variants={glowVariants}
          initial="initial"
          animate="animate"
        />
      )}

      {/* Main geometric shape - T inspired design */}
      <motion.g variants={shapeVariants}>
        {/* Top horizontal bar of T */}
        <motion.path
          d="M 20 30 L 80 30 L 80 38 L 20 38 Z"
          fill="url(#logoGradient)"
          variants={animated ? pathVariants : undefined}
        />

        {/* Vertical stem of T with angular design */}
        <motion.path
          d="M 46 30 L 54 30 L 54 70 L 46 70 Z"
          fill="url(#logoGradient)"
          variants={animated ? pathVariants : undefined}
        />

        {/* Left accent triangle */}
        <motion.path
          d="M 30 45 L 40 40 L 40 50 Z"
          fill="url(#logoGradient)"
          opacity="0.7"
          variants={animated ? pathVariants : undefined}
        />

        {/* Right accent triangle */}
        <motion.path
          d="M 70 45 L 60 40 L 60 50 Z"
          fill="url(#logoGradient)"
          opacity="0.7"
          variants={animated ? pathVariants : undefined}
        />

        {/* Bottom accent - angular base */}
        <motion.path
          d="M 42 70 L 50 78 L 58 70 Z"
          fill="url(#logoGradient)"
          variants={animated ? pathVariants : undefined}
        />
      </motion.g>

      {/* Outer frame - optional geometric border */}
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        stroke="url(#logoGradient)"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
        variants={animated ? pathVariants : undefined}
        filter="url(#glow)"
      />
    </motion.svg>
  );
};

export default TiltanLogo;
