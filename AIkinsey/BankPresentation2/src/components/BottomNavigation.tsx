import { ChevronLeft, ChevronRight, Volume2, VolumeX, Share2, Check } from 'lucide-react';
import { Button } from './ui/button';

interface BottomNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onGoToSlide: (index: number) => void;
  // Audio controls
  isMuted: boolean;
  isPlaying: boolean;
  onToggleMute: () => void;
  // Share controls
  copied: boolean;
  onShare: () => void;
}

export function BottomNavigation({
  currentSlide,
  totalSlides,
  onPrevSlide,
  onNextSlide,
  onGoToSlide,
  isMuted,
  isPlaying,
  onToggleMute,
  copied,
  onShare,
}: BottomNavigationProps) {
  const slides = Array.from({ length: totalSlides }, (_, i) => i);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Container Query Wrapper */}
      <div className="@container">
        {/* Single Unified Navigation Bar with Auto Layout */}
        <div className="flex items-center justify-center gap-[clamp(0.25rem,1vw,0.75rem)] px-[clamp(0.75rem,2vw,1.5rem)] py-[clamp(0.5rem,1.5vw,1rem)] bg-slate-900/90 backdrop-blur-md border-t border-slate-800">

          {/* Prev Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevSlide}
            disabled={currentSlide === 0}
            className="bg-slate-900/80 backdrop-blur-sm border-slate-700 text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-xl touch-manipulation shrink-0"
            style={{ width: 'clamp(2.25rem, 10vw, 2.75rem)', height: 'clamp(2.25rem, 10vw, 2.75rem)' }}
            aria-label="Previous slide"
          >
            <ChevronLeft style={{ width: 'clamp(1rem, 4vw, 1.25rem)', height: 'clamp(1rem, 4vw, 1.25rem)' }} />
          </Button>

          {/* Audio Control */}
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleMute}
            className={`backdrop-blur-sm transition-all rounded-xl touch-manipulation shrink-0 ${
              isMuted || !isPlaying
                ? 'bg-slate-900/80 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
                : 'bg-slate-900/80 border-emerald-500/50 text-emerald-400 hover:bg-slate-800 hover:border-emerald-500'
            }`}
            style={{ width: 'clamp(2.25rem, 10vw, 2.75rem)', height: 'clamp(2.25rem, 10vw, 2.75rem)' }}
            aria-label={
              !isPlaying
                ? 'Start background music'
                : isMuted
                ? 'Unmute background music'
                : 'Mute background music'
            }
            title={
              !isPlaying
                ? 'Click to play music'
                : isMuted
                ? 'Click to unmute'
                : 'Click to mute'
            }
          >
            {isMuted || !isPlaying ? (
              <VolumeX style={{ width: 'clamp(1rem, 4vw, 1.25rem)', height: 'clamp(1rem, 4vw, 1.25rem)' }} />
            ) : (
              <Volume2 style={{ width: 'clamp(1rem, 4vw, 1.25rem)', height: 'clamp(1rem, 4vw, 1.25rem)' }} />
            )}
          </Button>

          {/* Share Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onShare}
            className="bg-slate-900/80 backdrop-blur-sm border-slate-700 text-white hover:bg-slate-800 hover:border-blue-500/50 hover:text-blue-400 transition-all rounded-xl touch-manipulation shrink-0"
            style={{ width: 'clamp(2.25rem, 10vw, 2.75rem)', height: 'clamp(2.25rem, 10vw, 2.75rem)' }}
            aria-label="Share presentation"
            title={copied ? 'Link copied!' : 'Share presentation'}
          >
            {copied ? (
              <Check style={{ width: 'clamp(1rem, 4vw, 1.25rem)', height: 'clamp(1rem, 4vw, 1.25rem)' }} className="text-green-400" />
            ) : (
              <Share2 style={{ width: 'clamp(1rem, 4vw, 1.25rem)', height: 'clamp(1rem, 4vw, 1.25rem)' }} />
            )}
          </Button>

          {/* Slide Indicators (Dots) - Scrollable Container */}
          <div className="flex items-center bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 mx-[clamp(0.25rem,1vw,0.75rem)] overflow-hidden max-w-[50vw] sm:max-w-none">
            <div className="flex items-center gap-[clamp(0.25rem,0.5vw,0.5rem)] px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.375rem,1vw,0.625rem)] overflow-x-auto snap-x snap-mandatory scrollbar-width-none [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]">
              {slides.map((index) => (
                <button
                  key={index}
                  onClick={() => onGoToSlide(index)}
                  className={`rounded-full transition-all touch-manipulation snap-center flex-shrink-0 ${
                    index === currentSlide
                      ? 'bg-white'
                      : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                  style={{
                    width: index === currentSlide ? 'clamp(1.5rem, 4vw, 2.5rem)' : 'clamp(0.375rem, 1vw, 0.5rem)',
                    height: 'clamp(0.375rem, 1vw, 0.5rem)',
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Slide Counter */}
          <div className="flex items-center gap-[clamp(0.125rem,0.5vw,0.25rem)] bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 shrink-0"
            style={{ padding: 'clamp(0.375rem, 1vw, 0.625rem) clamp(0.5rem, 1.5vw, 1rem)' }}
          >
            <span className="text-white font-medium tabular-nums" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>{currentSlide + 1}</span>
            <span className="text-slate-500" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>/</span>
            <span className="text-slate-400 tabular-nums" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>{totalSlides}</span>
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onNextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="bg-slate-900/80 backdrop-blur-sm border-slate-700 text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-xl touch-manipulation shrink-0"
            style={{ width: 'clamp(2.25rem, 10vw, 2.75rem)', height: 'clamp(2.25rem, 10vw, 2.75rem)' }}
            aria-label="Next slide"
          >
            <ChevronRight style={{ width: 'clamp(1rem, 4vw, 1.25rem)', height: 'clamp(1rem, 4vw, 1.25rem)' }} />
          </Button>

        </div>
      </div>
    </nav>
  );
}
