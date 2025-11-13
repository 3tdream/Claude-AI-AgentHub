import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from './components/ui/button';
import { TitleSlide } from './components/TitleSlide';
import { AboutSlide } from './components/AboutSlide';
import { VisionSlide } from './components/VisionSlide';
import { DigitalTransformationSlide } from './components/DigitalTransformationSlide';
import { InnovationSlide } from './components/InnovationSlide';
import { CustomerExperienceSlide } from './components/CustomerExperienceSlide';
import { TechnologySlide } from './components/TechnologySlide';
import { SustainabilitySlide } from './components/SustainabilitySlide';
import { SecuritySlide } from './components/SecuritySlide';
import { PartnershipsSlide } from './components/PartnershipsSlide';
import { ResultsSlide } from './components/ResultsSlide';
import { ClosingSlide } from './components/ClosingSlide';

const slides = [
  TitleSlide,
  AboutSlide,
  VisionSlide,
  DigitalTransformationSlide,
  InnovationSlide,
  CustomerExperienceSlide,
  TechnologySlide,
  SustainabilitySlide,
  SecuritySlide,
  PartnershipsSlide,
  ResultsSlide,
  ClosingSlide,
];

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

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
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
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

      {/* Navigation Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="bg-slate-900/80 backdrop-blur-sm border-slate-700 text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all h-11 w-11 rounded-xl"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Slide Indicators */}
        <div className="flex gap-2.5 bg-slate-900/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-slate-800">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-10'
                  : 'bg-slate-600 w-2 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="bg-slate-900/80 backdrop-blur-sm border-slate-700 text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all h-11 w-11 rounded-xl"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Slide Counter */}
      <div className="absolute top-10 right-10 bg-slate-900/50 backdrop-blur-sm px-5 py-2.5 rounded-xl border border-slate-800 z-10">
        <span className="text-white font-medium">{currentSlide + 1}</span>
        <span className="text-slate-500 mx-1">/</span>
        <span className="text-slate-400">{slides.length}</span>
      </div>
    </div>
  );
}
