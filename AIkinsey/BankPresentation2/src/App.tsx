import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BackgroundAudio, BackgroundAudioHandle } from './components/BackgroundAudio';
import { useShare } from './components/ShareButton';
import { BottomNavigation } from './components/BottomNavigation';
import { TitleSlide } from './components/TitleSlide';
import { AboutSlide } from './components/AboutSlide'; // Problem
import { SolutionSlide } from './components/SolutionSlide';
import { VisionSlide } from './components/VisionSlide'; // Roadmap
import { CustomerExperienceSlide } from './components/CustomerExperienceSlide'; // Market
import { DigitalTransformationSlide } from './components/DigitalTransformationSlide'; // Competition
import { ResultsSlide } from './components/ResultsSlide'; // Traction
import { TechnologySlide } from './components/TechnologySlide'; // Business Model
import { InnovationSlide } from './components/InnovationSlide'; // Financials
import { SecuritySlide } from './components/SecuritySlide'; // Team
import { PartnershipsSlide } from './components/PartnershipsSlide'; // GTM
import { SustainabilitySlide } from './components/SustainabilitySlide'; // Moat
import { ClosingSlide } from './components/ClosingSlide'; // Vision & Ask

const slides = [
  TitleSlide,          // 1. Title
  AboutSlide,          // 2. Problem
  SolutionSlide,       // 3. Solution
  VisionSlide,         // 4. Roadmap
  CustomerExperienceSlide, // 5. Market
  DigitalTransformationSlide, // 6. Competition
  ResultsSlide,        // 7. Traction
  TechnologySlide,     // 8. Business Model
  InnovationSlide,     // 9. Financials
  SecuritySlide,       // 10. Team
  PartnershipsSlide,   // 11. GTM
  SustainabilitySlide, // 12. Moat
  ClosingSlide,        // 13. Vision & Ask
];

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const audioRef = useRef<BackgroundAudioHandle>(null);
  const { copied, handleShare } = useShare();

  // Touch swipe state
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  // Handle touch swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const deltaX = touchStartX.current - touchEndX.current;
    const deltaY = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 50; // Minimum swipe distance in pixels

    // Check if horizontal swipe is dominant (not vertical scroll)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swiped left - go to next slide
        nextSlide();
      } else {
        // Swiped right - go to previous slide
        prevSlide();
      }
    }

    // Reset touch positions
    touchStartX.current = 0;
    touchEndX.current = 0;
    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const CurrentSlideComponent = slides[currentSlide];

  return (
    <div
      className="relative w-full h-screen min-h-[100dvh] overflow-hidden bg-slate-950"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Audio Element */}
      <BackgroundAudio ref={audioRef} />

      {/* Slide Content */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
        >
          <CurrentSlideComponent />
        </motion.div>
      </AnimatePresence>

      {/* Unified Bottom Navigation */}
      <BottomNavigation
        currentSlide={currentSlide}
        totalSlides={slides.length}
        onPrevSlide={prevSlide}
        onNextSlide={nextSlide}
        onGoToSlide={goToSlide}
        isMuted={audioRef.current?.isMuted ?? false}
        isPlaying={audioRef.current?.isPlaying ?? false}
        onToggleMute={() => audioRef.current?.toggleMute()}
        copied={copied}
        onShare={handleShare}
      />
    </div>
  );
}
