import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Sparkles, Play, Plus, FileText, Palette, Zap } from 'lucide-react';

interface SlideshowInfo {
  id: string;
  name: string;
  description: string;
  theme: string;
  slides: number;
}

interface Manifest {
  slideshows: SlideshowInfo[];
}

export function SlideshowList() {
  const [slideshows, setSlideshows] = useState<SlideshowInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSlideshows();
  }, []);

  const loadSlideshows = async () => {
    try {
      const response = await fetch('/slideshows/manifest.json');
      const data: Manifest = await response.json();
      setSlideshows(data.slideshows);
    } catch (err) {
      console.error('Failed to load slideshows:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">AI Slideshow Maker</span>
          </div>

          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button variant="ghost" size="sm">
              <Palette className="w-4 h-4 mr-2" />
              Themes
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Slideshow
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
              Powered by AI
            </span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight">
            Create Beautiful
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI-Powered Slideshows
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Design stunning presentations with JSON-driven templates. Customize colors, layouts, and animations in real-time.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              Create New Slideshow
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Play className="w-4 h-4" />
              View Examples
            </Button>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          <Card>
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center mb-2">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">JSON-Driven</CardTitle>
              <CardDescription>
                Define your entire slideshow with simple JSON configuration
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-950 flex items-center justify-center mb-2">
                <Palette className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <CardTitle className="text-lg">Real-time Customization</CardTitle>
              <CardDescription>
                Adjust colors, themes, and animations on the fly
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-2">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">6 Layout Types</CardTitle>
              <CardDescription>
                Choose from centered, split, minimal, grid, and more
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <Separator className="my-12" />

        {/* Slideshows Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Your Slideshows</h2>
              <p className="text-muted-foreground mt-1">
                {slideshows.length} {slideshows.length === 1 ? 'presentation' : 'presentations'} ready to present
              </p>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          {slideshows.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No slideshows yet</h3>
                  <p className="text-muted-foreground text-center max-w-sm mb-6">
                    Get started by creating your first AI-powered slideshow or explore our templates
                  </p>
                  <div className="flex gap-3">
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Slideshow
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Play className="w-4 h-4" />
                      View Templates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* Slideshows Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slideshows.map((slideshow, index) => (
                <motion.div
                  key={slideshow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link to={`/${slideshow.id}`}>
                    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-purple-200 dark:hover:border-purple-800 overflow-hidden">
                      {/* Preview Image/Gradient */}
                      <div className={`h-40 relative ${
                        slideshow.theme === 'dark'
                          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
                          : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'
                      }`}>
                        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
                        <div className="absolute top-3 right-3">
                          <Badge variant={slideshow.theme === 'dark' ? 'default' : 'secondary'}>
                            {slideshow.slides} slides
                          </Badge>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary" className="gap-2">
                            <Play className="w-3 h-3" />
                            Present
                          </Button>
                        </div>
                      </div>

                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {slideshow.name}
                          </CardTitle>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {slideshow.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {slideshow.theme}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {slideshow.id}.json
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* How to Add Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16"
        >
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-100 dark:border-purple-900">
            <CardHeader>
              <CardTitle className="text-2xl">Add Your Own Slideshow</CardTitle>
              <CardDescription>Follow these simple steps to create a custom presentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <h3 className="font-semibold">Create JSON File</h3>
                  <p className="text-sm text-muted-foreground">
                    Use our templates to define your slides, theme, and layouts
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <h3 className="font-semibold">Save to Folder</h3>
                  <p className="text-sm text-muted-foreground">
                    Place your file in <code className="text-xs bg-background px-1 py-0.5 rounded">public/slideshows/</code>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <h3 className="font-semibold">Update Manifest</h3>
                  <p className="text-sm text-muted-foreground">
                    Add an entry to manifest.json with your slideshow details
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <h3 className="font-semibold">View & Present</h3>
                  <p className="text-sm text-muted-foreground">
                    Your slideshow will appear here, ready to present
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Need help? Check out our documentation
                </p>
                <Button variant="outline" size="sm">
                  View Docs
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>AI Slideshow Maker</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">About</button>
              <button className="hover:text-foreground transition-colors">Templates</button>
              <button className="hover:text-foreground transition-colors">Documentation</button>
              <button className="hover:text-foreground transition-colors">GitHub</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
