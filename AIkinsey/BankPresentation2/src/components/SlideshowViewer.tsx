import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Settings,
  Home,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Palette,
  Zap,
  Keyboard,
  X
} from 'lucide-react';

interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    panelBackground: string;
    text: string;
    textSecondary: string;
    border: string;
    controlBg: string;
    controlText: string;
    controlHover: string;
  };
  fonts: {
    title: string;
    body: string;
  };
  effects: {
    borderRadius: string;
    shadow: string;
  };
}

interface GridItem {
  title: string;
  content: string;
}

interface Slide {
  layout: 'centered' | 'split-left' | 'split-right' | 'minimal' | 'image-focus' | 'grid';
  animation: 'fade' | 'slide-right' | 'slide-left' | 'zoom' | 'slide-bottom';
  background?: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  content?: string;
  items?: string[];
  gridItems?: GridItem[];
  image?: string;
  footer?: string;
  textColor?: string;
  badgeColor?: string;
  badgeBorder?: string;
  badgeText?: string;
}

interface SlideshowData {
  theme: Theme;
  slides: Slide[];
}

const animationVariants = {
  'fade': {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 }
  },
  'slide-right': {
    enter: { x: 100, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 }
  },
  'slide-left': {
    enter: { x: -100, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 }
  },
  'zoom': {
    enter: { scale: 0.9, opacity: 0 },
    center: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 }
  },
  'slide-bottom': {
    enter: { y: 50, opacity: 0 },
    center: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 }
  }
};

export function SlideshowViewer() {
  const { name } = useParams<{ name: string }>();
  const [slideshow, setSlideshow] = useState<SlideshowData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [customTheme, setCustomTheme] = useState<Theme | null>(null);
  const [customAnimation, setCustomAnimation] = useState<string | null>(null);

  useEffect(() => {
    loadSlideshow();
  }, [name]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        if (presentationMode) {
          setPresentationMode(false);
        } else {
          window.location.href = '/';
        }
      } else if (e.key === 'f' || e.key === 'F') {
        setPresentationMode(!presentationMode);
      } else if (e.key === '?' || e.key === '/') {
        setShowKeyboardHelp(!showKeyboardHelp);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, slideshow, presentationMode, showKeyboardHelp]);

  const loadSlideshow = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/slideshows/${name}.json`);
      if (!response.ok) {
        throw new Error('Slideshow not found');
      }
      const data = await response.json();
      setSlideshow(data);
      setCustomTheme(data.theme);
      setCurrentSlide(0);
      applyTheme(data.theme);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load slideshow');
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    document.body.style.backgroundColor = theme.colors.background;
    document.body.style.color = theme.colors.text;
    document.body.style.fontFamily = theme.fonts.body;
  };

  const updateThemeColor = (key: string, value: string) => {
    if (customTheme) {
      const newTheme = {
        ...customTheme,
        colors: {
          ...customTheme.colors,
          [key]: value
        }
      };
      setCustomTheme(newTheme);
      applyTheme(newTheme);
    }
  };

  const nextSlide = () => {
    if (slideshow && currentSlide < slideshow.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const loadImage = (imageKey: string) => {
    return `https://via.placeholder.com/600x400/667eea/ffffff?text=${imageKey}`;
  };

  const renderSlide = (slide: Slide, theme: Theme) => {
    const textColor = slide.textColor || theme.colors.text;
    const badgeColor = slide.badgeColor || `${theme.colors.primary}15`;
    const badgeBorder = slide.badgeBorder || `${theme.colors.primary}30`;
    const badgeText = slide.badgeText || theme.colors.primary;

    // Centered Layout
    if (slide.layout === 'centered') {
      return (
        <div
          className="w-full h-full flex flex-col items-center justify-center text-center px-16 py-12"
          style={{ background: slide.background || theme.colors.background, color: textColor }}
        >
          <div className="max-w-4xl">
            {slide.badge && (
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs uppercase tracking-wider"
                style={{ background: badgeColor, border: `1px solid ${badgeBorder}`, color: badgeText }}
              >
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: badgeText }} />
                {slide.badge}
              </div>
            )}
            {slide.title && (
              <h1 className="text-6xl font-bold mb-6 leading-tight" style={{
                fontFamily: theme.fonts.title,
                color: slide.textColor || undefined,
                ...((!slide.textColor) && {
                  background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                })
              }}>
                {slide.title}
              </h1>
            )}
            {slide.subtitle && (
              <div className="text-2xl mb-8" style={{ color: slide.textColor ? `${slide.textColor}cc` : theme.colors.textSecondary }}>
                {slide.subtitle}
              </div>
            )}
            {slide.content && (
              <div className="text-xl leading-relaxed mb-6" style={{ color: slide.textColor ? `${slide.textColor}dd` : theme.colors.text }}>
                {slide.content}
              </div>
            )}
            {slide.items && slide.items.length > 0 && (
              <ul className="space-y-4 text-left inline-block text-lg">
                {slide.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3" style={{ color: textColor }}>
                    <span style={{ color: slide.textColor || theme.colors.primary }}>→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {slide.footer && (
              <div className="mt-12 text-sm uppercase tracking-widest opacity-70" style={{ color: slide.textColor ? `${slide.textColor}99` : theme.colors.textSecondary }}>
                {slide.footer}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Split Left Layout
    if (slide.layout === 'split-left') {
      return (
        <div className="w-full h-full flex flex-row" style={{ background: slide.background || theme.colors.background }}>
          <div className="w-1/2 flex items-center justify-center p-12">
            {slide.image && (
              <img src={loadImage(slide.image)} alt={slide.title} className="max-w-full max-h-[600px] object-contain rounded-2xl" style={{ boxShadow: theme.effects.shadow }} />
            )}
          </div>
          <div className="w-1/2 flex flex-col justify-center p-16" style={{ color: textColor }}>
            {slide.badge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs uppercase tracking-wider w-fit" style={{ background: badgeColor, border: `1px solid ${badgeBorder}`, color: badgeText }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: badgeText }} />
                {slide.badge}
              </div>
            )}
            {slide.title && (
              <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: theme.fonts.title, background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {slide.title}
              </h1>
            )}
            {slide.subtitle && (
              <div className="text-xl mb-6" style={{ color: theme.colors.textSecondary }}>
                {slide.subtitle}
              </div>
            )}
            {slide.content && (
              <div className="text-lg leading-relaxed mb-6" style={{ color: textColor }}>
                {slide.content}
              </div>
            )}
            {slide.items && slide.items.length > 0 && (
              <ul className="space-y-3">
                {slide.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-lg" style={{ color: textColor }}>
                    <span style={{ color: theme.colors.primary }}>→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      );
    }

    // Split Right Layout
    if (slide.layout === 'split-right') {
      return (
        <div className="w-full h-full flex flex-row" style={{ background: slide.background || theme.colors.background }}>
          <div className="w-1/2 flex flex-col justify-center p-16" style={{ color: textColor }}>
            {slide.badge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs uppercase tracking-wider w-fit" style={{ background: badgeColor, border: `1px solid ${badgeBorder}`, color: badgeText }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: badgeText }} />
                {slide.badge}
              </div>
            )}
            {slide.title && (
              <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: theme.fonts.title, background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {slide.title}
              </h1>
            )}
            {slide.subtitle && (
              <div className="text-xl mb-6" style={{ color: theme.colors.textSecondary }}>
                {slide.subtitle}
              </div>
            )}
            {slide.content && (
              <div className="text-lg leading-relaxed mb-6" style={{ color: textColor }}>
                {slide.content}
              </div>
            )}
            {slide.items && slide.items.length > 0 && (
              <ul className="space-y-3">
                {slide.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-lg" style={{ color: textColor }}>
                    <span style={{ color: theme.colors.primary }}>→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="w-1/2 flex items-center justify-center p-12">
            {slide.image && (
              <img src={loadImage(slide.image)} alt={slide.title} className="max-w-full max-h-[600px] object-contain rounded-2xl" style={{ boxShadow: theme.effects.shadow }} />
            )}
          </div>
        </div>
      );
    }

    // Minimal Layout
    if (slide.layout === 'minimal') {
      return (
        <div className="w-full h-full flex flex-col justify-center px-24 py-16" style={{ background: slide.background || theme.colors.background, color: textColor }}>
          <div className="max-w-3xl">
            {slide.badge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs uppercase tracking-wider" style={{ background: badgeColor, border: `1px solid ${badgeBorder}`, color: badgeText }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: badgeText }} />
                {slide.badge}
              </div>
            )}
            {slide.title && (
              <h1 className="text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: theme.fonts.title, background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {slide.title}
              </h1>
            )}
            {slide.subtitle && (
              <div className="text-2xl mb-8" style={{ color: theme.colors.textSecondary }}>
                {slide.subtitle}
              </div>
            )}
            {slide.content && (
              <div className="text-xl leading-relaxed mb-8" style={{ color: textColor }}>
                {slide.content}
              </div>
            )}
            {slide.items && slide.items.length > 0 && (
              <ul className="space-y-4">
                {slide.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-xl" style={{ color: textColor }}>
                    <span style={{ color: theme.colors.primary }}>→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      );
    }

    // Image Focus Layout
    if (slide.layout === 'image-focus') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-16" style={{ background: slide.background || theme.colors.background, color: textColor }}>
          <div className="max-w-5xl w-full text-center">
            {slide.badge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs uppercase tracking-wider" style={{ background: badgeColor, border: `1px solid ${badgeBorder}`, color: badgeText }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: badgeText }} />
                {slide.badge}
              </div>
            )}
            {slide.title && (
              <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: theme.fonts.title, background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {slide.title}
              </h1>
            )}
            {slide.subtitle && (
              <div className="text-xl mb-8" style={{ color: theme.colors.textSecondary }}>
                {slide.subtitle}
              </div>
            )}
            {slide.image && (
              <div className="mb-8">
                <img src={loadImage(slide.image)} alt={slide.title} className="w-full max-h-[500px] object-contain rounded-2xl mx-auto" style={{ boxShadow: theme.effects.shadow }} />
              </div>
            )}
            {slide.content && (
              <div className="text-lg leading-relaxed" style={{ color: textColor }}>
                {slide.content}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Grid Layout
    if (slide.layout === 'grid') {
      return (
        <div className="w-full h-full flex flex-col p-16" style={{ background: slide.background || theme.colors.background, color: textColor }}>
          <div className="text-center mb-12">
            {slide.badge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs uppercase tracking-wider" style={{ background: badgeColor, border: `1px solid ${badgeBorder}`, color: badgeText }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: badgeText }} />
                {slide.badge}
              </div>
            )}
            {slide.title && (
              <h1 className="text-5xl font-bold mb-4 leading-tight" style={{ fontFamily: theme.fonts.title, background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {slide.title}
              </h1>
            )}
            {slide.subtitle && (
              <div className="text-xl" style={{ color: theme.colors.textSecondary }}>
                {slide.subtitle}
              </div>
            )}
          </div>
          {slide.gridItems && slide.gridItems.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-1">
              {slide.gridItems.map((item, i) => (
                <div key={i} className="p-8 rounded-2xl hover:transform hover:-translate-y-2 transition-transform" style={{ background: theme.colors.panelBackground, border: `1px solid ${theme.colors.border}` }}>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: theme.colors.primary }}>
                    {item.title}
                  </h3>
                  <p className="text-base" style={{ color: theme.colors.textSecondary }}>
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading slideshow...</p>
        </div>
      </div>
    );
  }

  if (error || !slideshow) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <h1 className="text-2xl font-bold">Slideshow Not Found</h1>
            <p className="text-muted-foreground">{error || 'The requested slideshow could not be loaded.'}</p>
            <Link to="/">
              <Button>
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const slide = slideshow.slides[currentSlide];
  const theme = customTheme || slideshow.theme;
  const animation = customAnimation || slide.animation;
  const variants = animationVariants[animation as keyof typeof animationVariants];
  const progress = ((currentSlide + 1) / slideshow.slides.length) * 100;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Top Toolbar */}
      <AnimatePresence>
        {!presentationMode && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b"
          >
            <div className="container mx-auto px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Separator orientation="vertical" className="h-6" />
                <Badge variant="outline">{slideshow.slides.length} slides</Badge>
                <span className="text-sm text-muted-foreground">{name}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                >
                  <Keyboard className="w-4 h-4 mr-2" />
                  Shortcuts
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowControls(!showControls)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Customize
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPresentationMode(true)}
                >
                  {presentationMode ? <Minimize className="w-4 h-4 mr-2" /> : <Maximize className="w-4 h-4 mr-2" />}
                  Present
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-muted">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customization Panel */}
      <AnimatePresence>
        {showControls && !presentationMode && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="absolute top-14 right-0 bottom-0 w-96 bg-background border-l z-40 overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Customize</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowControls(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Tabs defaultValue="theme" className="flex-1 flex flex-col">
              <TabsList className="mx-4 mt-2">
                <TabsTrigger value="theme" className="flex-1">
                  <Palette className="w-4 h-4 mr-2" />
                  Theme
                </TabsTrigger>
                <TabsTrigger value="animation" className="flex-1">
                  <Zap className="w-4 h-4 mr-2" />
                  Animation
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 px-4">
                <TabsContent value="theme" className="space-y-4 mt-4 pb-4">
                  <div className="space-y-3">
                    {Object.entries(theme.colors).map(([key, value]) => (
                      <div key={key} className="space-y-1.5">
                        <label className="text-xs font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => updateThemeColor(key, e.target.value)}
                            className="w-12 h-9 rounded border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateThemeColor(key, e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm bg-muted rounded border"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="animation" className="space-y-3 mt-4 pb-4">
                  {Object.keys(animationVariants).map((anim) => (
                    <Button
                      key={anim}
                      onClick={() => setCustomAnimation(anim)}
                      variant={(customAnimation || slide.animation) === anim ? 'default' : 'outline'}
                      className="w-full justify-start"
                    >
                      {anim}
                    </Button>
                  ))}
                </TabsContent>
              </ScrollArea>

              <div className="p-4 border-t space-y-2">
                <Button
                  onClick={() => {
                    if (slideshow) {
                      setCustomTheme(slideshow.theme);
                      setCustomAnimation(null);
                      applyTheme(slideshow.theme);
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Reset to Original
                </Button>
              </div>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Overlay */}
      <AnimatePresence>
        {showKeyboardHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowKeyboardHelp(false)}
          >
            <Card className="max-w-md">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowKeyboardHelp(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Next slide</span>
                    <Badge variant="outline">→ or Space</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Previous slide</span>
                    <Badge variant="outline">←</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Presentation mode</span>
                    <Badge variant="outline">F</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Show shortcuts</span>
                    <Badge variant="outline">?</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Exit / Home</span>
                    <Badge variant="outline">Esc</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Slide Area */}
      <div className={`w-full h-full ${!presentationMode ? 'pt-14' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            {renderSlide(slide, theme)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <AnimatePresence>
        {!presentationMode && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="absolute bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t"
          >
            <div className="container mx-auto px-6 h-16 flex items-center justify-center gap-4">
              <Button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {currentSlide + 1}
                </span>
                <span className="text-sm text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">
                  {slideshow.slides.length}
                </span>
              </div>

              <Button
                onClick={nextSlide}
                disabled={currentSlide === slideshow.slides.length - 1}
                variant="outline"
                size="sm"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
