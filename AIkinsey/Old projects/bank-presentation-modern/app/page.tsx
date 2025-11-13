"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlideRenderer } from "@/components/SlideRenderer";
import slidesData from "@/data/slides.json";
import { PresentationData } from "@/types/slides";

const data: PresentationData = slidesData as PresentationData;

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copied, setCopied] = useState(false);
  const totalSlides = data.presentation.totalSlides;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <SlideRenderer slide={data.slides[currentSlide]} />
      </AnimatePresence>

      {/* Navigation Controls */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            onClick={prevSlide}
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </motion.div>

        {/* Slide Indicators */}
        <div className="flex gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/40 hover:bg-white/60 w-2"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              animate={{
                width: index === currentSlide ? "32px" : "8px",
                backgroundColor:
                  index === currentSlide
                    ? "rgba(255, 255, 255, 1)"
                    : "rgba(255, 255, 255, 0.4)",
              }}
              transition={{ duration: 0.3 }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            onClick={nextSlide}
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md"
            disabled={currentSlide === totalSlides - 1}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Top Right Controls */}
      <motion.div
        className="fixed top-8 right-8 z-50 flex items-center gap-3"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Share Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleShare}
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md"
            title={copied ? "Link copied!" : "Share presentation"}
          >
            {copied ? (
              <Check className="w-5 h-5" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
          </Button>
        </motion.div>

        {/* Slide Counter */}
        <motion.div
          className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white border border-white/30"
          key={`counter-${currentSlide}`}
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentSlide + 1} / {totalSlides}
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Keyboard Hint */}
      <motion.div
        className="fixed top-8 left-8 z-50 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white/70 text-sm border border-white/30"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        whileHover={{ scale: 1.05, opacity: 1 }}
      >
        Use ← → arrows or spacebar to navigate
      </motion.div>
    </div>
  );
}
