"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Share2, Check, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlideRenderer } from "@/components/SlideRenderer";
import { NavigationSettings, NavigationConfig, defaultConfig } from "@/components/NavigationSettings";
import { JsonEditor } from "@/components/JsonEditor";
import { ColorPaletteEditor } from "@/components/ColorPaletteEditor";
import { AnimationEditor } from "@/components/AnimationEditor";
import { ImageLinkEditor } from "@/components/ImageLinkEditor";
import { ThemeManager } from "@/components/ThemeManager";
import { AudioManager } from "@/components/AudioManager";
import { defaultThemes } from "@/lib/themes";
import slidesData from "@/data/slides.json";
import { PresentationData } from "@/types/slides";

const data: PresentationData = slidesData as PresentationData;

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [navConfig, setNavConfig] = useState<NavigationConfig>(defaultConfig);
  const [presentationData, setPresentationData] = useState<PresentationData>(data);
  const [audioSource, setAudioSource] = useState<string>('/audio/background-music.mp3');
  const [audioAvailable, setAudioAvailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const totalSlides = presentationData.presentation.totalSlides;

  // Load config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('navigation-config');
    if (savedConfig) {
      try {
        setNavConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to parse saved config:', e);
      }
    }

    // Load saved presentation data
    const savedData = localStorage.getItem('presentation-data');
    if (savedData) {
      try {
        setPresentationData(JSON.parse(savedData));
      } catch (e) {
        console.error('Failed to parse saved presentation data:', e);
      }
    }

    // Load saved color scheme
    const savedColors = localStorage.getItem('color-scheme');
    if (savedColors) {
      try {
        const scheme = JSON.parse(savedColors);
        const root = document.documentElement;
        const isDarkMode = root.classList.contains('dark');
        const currentScheme = isDarkMode ? scheme.dark : scheme.light;

        Object.entries(currentScheme).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value as string);
        });
      } catch (e) {
        console.error('Failed to apply saved color scheme:', e);
      }
    }

    // Load and apply saved theme preset
    const savedThemeId = localStorage.getItem('current-theme');
    if (savedThemeId) {
      const root = document.documentElement;
      let theme = null;

      // First, check built-in themes
      theme = defaultThemes.find((t) => t.id === savedThemeId);

      // If not found in built-in, check custom themes
      if (!theme) {
        const customThemes = localStorage.getItem('custom-themes');
        if (customThemes) {
          try {
            const themes = JSON.parse(customThemes);
            theme = themes.find((t: any) => t.id === savedThemeId);
          } catch (e) {
            console.error('Failed to load custom theme:', e);
          }
        }
      }

      // If theme is found, apply it
      if (theme) {
        // Apply colors
        Object.entries(theme.colors).forEach(([key, value]) => {
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          root.style.setProperty(`--theme-${cssKey}`, value as string);
        });

        // Apply gradients
        Object.entries(theme.gradients).forEach(([key, value]) => {
          root.style.setProperty(`--theme-gradient-${key}`, value as string);
        });
      }
    }

    // Load saved audio source
    const savedAudio = localStorage.getItem('background-audio');
    if (savedAudio) {
      setAudioSource(savedAudio);
    }

    // Check if audio file exists
    const checkAudioAvailability = async () => {
      try {
        const response = await fetch(savedAudio || audioSource, { method: 'HEAD' });
        setAudioAvailable(response.ok);
      } catch {
        setAudioAvailable(false);
      }
    };

    checkAudioAvailability();

    // Listen for audio updates
    const handleAudioUpdate = (event: CustomEvent) => {
      setAudioSource(event.detail.url);
      setAudioAvailable(true);
    };

    window.addEventListener('audio-updated', handleAudioUpdate as EventListener);
    return () => {
      window.removeEventListener('audio-updated', handleAudioUpdate as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save config to localStorage
  const handleConfigChange = (newConfig: NavigationConfig) => {
    setNavConfig(newConfig);
    localStorage.setItem('navigation-config', JSON.stringify(newConfig));
  };

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

  const toggleSound = async () => {
    if (!audioAvailable) {
      console.warn("No audio file available. Please add audio using the Audio Manager.");
      return;
    }

    if (audioRef.current) {
      try {
        if (isMuted) {
          // First set the state, then play
          setIsMuted(false);
          await audioRef.current.play();
        } else {
          // First pause, then set the state
          audioRef.current.pause();
          setIsMuted(true);
        }
      } catch (err) {
        console.error("Audio toggle failed:", err);
        // Reset state on error
        setIsMuted(true);
      }
    }
  };

  const handleJsonSave = (newData: any) => {
    setPresentationData(newData as PresentationData);
    localStorage.setItem('presentation-data', JSON.stringify(newData));
    // Force reload to apply changes after showing success message
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleAnimationSave = (config: any) => {
    console.log('Animation config saved:', config);
    // Reload to apply animation changes
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleColorSchemeSave = (scheme: any) => {
    console.log('Color scheme saved:', scheme);
    // Color scheme is already applied by the editor
    // No reload needed as colors are applied in real-time
  };

  const handleImageLinksSave = (links: any) => {
    console.log('Image links saved:', links);

    // Update presentation data with new image links
    const updatedData = JSON.parse(JSON.stringify(presentationData));

    // Update each slide's background image
    links.forEach((link: any) => {
      const slideIndex = link.slideNumber - 1;
      if (updatedData.slides[slideIndex]) {
        updatedData.slides[slideIndex].background = {
          type: 'image',
          source: link.url,
          fallback: link.fallbackUrl || updatedData.slides[slideIndex].background?.fallback
        };
      }
    });

    // Save to state and localStorage
    setPresentationData(updatedData);
    localStorage.setItem('presentation-data', JSON.stringify(updatedData));

    // Reload to apply image changes
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleThemeApply = (theme: any) => {
    console.log('Theme applied:', theme);
    // Theme manager handles reload automatically
  };

  const handleThemeDataUpdate = (updatedData: any) => {
    setPresentationData(updatedData);
    localStorage.setItem('presentation-data', JSON.stringify(updatedData));
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

  // Render bottom navigation buttons based on config
  const renderBottomNavButton = (type: 'prev' | 'indicators' | 'next') => {
    if (!navConfig.bottomNav.visible[type]) return null;

    switch (type) {
      case 'prev':
        return (
          <motion.div key="prev" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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
        );

      case 'indicators':
        return (
          <div key="indicators" className="flex items-center justify-center gap-2">
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
        );

      case 'next':
        return (
          <motion.div key="next" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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
        );

      default:
        return null;
    }
  };

  // Render top navigation buttons based on config
  const renderTopNavButton = (type: 'share' | 'counter' | 'sound') => {
    if (!navConfig.topNav.visible[type]) return null;

    switch (type) {
      case 'sound':
        return (
          <motion.div key="sound" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={toggleSound}
              variant="outline"
              size="icon"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md"
              title={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
          </motion.div>
        );

      case 'share':
        return (
          <motion.div key="share" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
        );

      case 'counter':
        return (
          <motion.div
            key="counter"
            className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white border border-white/30"
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentSlide + 1} / {totalSlides}
            </motion.span>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Get position classes for containers
  const getBottomNavPosition = () => {
    switch (navConfig.bottomNav.position) {
      case 'left':
        return 'justify-start left-8';
      case 'right':
        return 'justify-end right-8';
      case 'center':
      default:
        return 'justify-center left-0 right-0';
    }
  };

  const getTopNavPosition = () => {
    switch (navConfig.topNav.position) {
      case 'left':
        return 'left-8';
      case 'right':
      default:
        return 'right-8';
    }
  };

  const getKeyboardHintPosition = () => {
    switch (navConfig.keyboardHint.position) {
      case 'top-left':
        return 'top-8 left-8';
      case 'top-right':
        return 'top-8 right-8';
      case 'bottom-left':
        return 'bottom-8 left-8';
      case 'bottom-right':
        return 'bottom-8 right-8';
      default:
        return 'top-8 left-8';
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <SlideRenderer slide={presentationData.slides[currentSlide]} />
      </AnimatePresence>

      {/* Bottom Navigation Controls */}
      <motion.div
        className={`fixed bottom-8 ${getBottomNavPosition()} z-50 flex items-center gap-4`}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {navConfig.bottomNav.order.map((item) => renderBottomNavButton(item))}
      </motion.div>

      {/* Top Navigation Controls */}
      <motion.div
        className={`fixed top-8 ${getTopNavPosition()} z-50 flex items-center gap-3`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {navConfig.topNav.order.map((item) => renderTopNavButton(item))}

        {/* Theme Manager */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <ThemeManager
            onApply={handleThemeApply}
            presentationData={presentationData}
            onDataUpdate={handleThemeDataUpdate}
          />
        </motion.div>

        {/* Editor Buttons */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <JsonEditor data={presentationData} onSave={handleJsonSave} title="Slides JSON Editor" description="Edit the entire presentation data in JSON format" />
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <ColorPaletteEditor onSave={handleColorSchemeSave} />
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <AnimationEditor onSave={handleAnimationSave} />
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <ImageLinkEditor
            onSave={handleImageLinksSave}
            totalSlides={totalSlides}
            presentationData={presentationData}
          />
        </motion.div>

        {/* Audio Manager */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <AudioManager />
        </motion.div>

        {/* Settings Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <NavigationSettings config={navConfig} onConfigChange={handleConfigChange} />
        </motion.div>
      </motion.div>

      {/* Keyboard Hint */}
      {navConfig.keyboardHint.visible && (
        <motion.div
          className={`fixed ${getKeyboardHintPosition()} z-50 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white/70 text-sm border border-white/30`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ scale: 1.05, opacity: 1 }}
        >
          Use ← → arrows or spacebar to navigate
        </motion.div>
      )}

      {/* Background Audio */}
      {audioAvailable && (
        <audio
          ref={audioRef}
          src={audioSource}
          loop
          preload="auto"
          onError={(e) => {
            console.warn("Audio failed to load. Use Audio Manager to add audio files.");
            setAudioAvailable(false);
          }}
          onCanPlayThrough={() => {
            setAudioAvailable(true);
          }}
        >
          Your browser does not support the audio element.
        </audio>
      )}
      {!audioAvailable && (
        <audio
          ref={audioRef}
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
}
