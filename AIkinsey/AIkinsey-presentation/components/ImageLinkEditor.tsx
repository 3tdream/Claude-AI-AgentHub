"use client";

import { useState, useEffect } from "react";
import { ImageIcon, Check, Plus, Trash2, ExternalLink, Upload, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImageLink {
  id: string;
  slideNumber: number;
  url: string;
  fallbackUrl?: string;
}

interface ImageLinkEditorProps {
  onSave?: (links: ImageLink[]) => void;
  totalSlides?: number;
  presentationData?: any;
}

export function ImageLinkEditor({ onSave, totalSlides = 16, presentationData }: ImageLinkEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [links, setLinks] = useState<ImageLink[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadLinks();
    }
  }, [isOpen, presentationData]);

  const loadLinks = () => {
    const saved = localStorage.getItem('image-links');
    if (saved) {
      try {
        setLinks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load image links:', e);
        initializeLinks();
      }
    } else {
      initializeLinks();
    }
  };

  const initializeLinks = () => {
    const initialLinks: ImageLink[] = [];

    // If we have presentation data, load from it
    if (presentationData?.slides) {
      presentationData.slides.forEach((slide: any, index: number) => {
        initialLinks.push({
          id: `slide-${index + 1}`,
          slideNumber: index + 1,
          url: slide.background?.source || `/assets/slide-${index + 1}.jpg`,
          fallbackUrl: slide.background?.fallback || `https://images.unsplash.com/photo-${1500000000000 + index}?crop=entropy&fit=max&fm=jpg&q=80&w=1920`,
        });
      });
    } else {
      // Fallback: initialize with default values
      for (let i = 1; i <= totalSlides; i++) {
        initialLinks.push({
          id: `slide-${i}`,
          slideNumber: i,
          url: `/assets/slide-${i}.jpg`,
          fallbackUrl: `https://images.unsplash.com/photo-${1500000000000 + i}?crop=entropy&fit=max&fm=jpg&q=80&w=1920`,
        });
      }
    }
    setLinks(initialLinks);
  };

  const handleSave = () => {
    // Save to localStorage for backup
    localStorage.setItem('image-links', JSON.stringify(links));

    // Call parent's onSave which updates the slides.json
    if (onSave) {
      onSave(links);
      // Don't close dialog yet - let the reload happen
      // The reload is handled by the parent component
    } else {
      setIsOpen(false);
    }
  };

  const updateLink = (id: string, field: 'url' | 'fallbackUrl', value: string) => {
    setLinks(prev =>
      prev.map(link =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  };

  const addNewLink = () => {
    const newSlideNumber = links.length + 1;
    setLinks(prev => [
      ...prev,
      {
        id: `slide-${newSlideNumber}`,
        slideNumber: newSlideNumber,
        url: `/assets/slide-${newSlideNumber}.jpg`,
        fallbackUrl: '',
      },
    ]);
  };

  const deleteLink = (id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id));
  };

  const testImageUrl = (url: string) => {
    window.open(url, '_blank');
  };

  const browseImage = (id: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Create a data URL for immediate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        updateLink(id, 'url', dataUrl);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const uploadToAssets = (id: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // Create FormData
        const formData = new FormData();
        formData.append('file', file);

        const link = links.find(l => l.id === id);
        if (link) {
          formData.append('slideNumber', link.slideNumber.toString());
        }

        // In a real scenario, you would upload to your server
        // For now, we'll convert to data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          updateLink(id, 'url', dataUrl);

          // Show success message
          alert(`Image uploaded successfully! Note: This is a data URL. To use files in production, you should upload them to your server or cloud storage.`);
        };
        reader.readAsDataURL(file);

      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload image. Please try again.');
      }
    };
    input.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="icon"
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md"
          title="Image Link Editor"
        >
          <ImageIcon className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Image Link Editor</DialogTitle>
          <DialogDescription>
            Manage slide background images and fallback URLs
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6 mt-4">
            {links.map((link) => (
              <div key={link.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Slide {link.slideNumber}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteLink(link.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Primary Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={link.url}
                      onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                      placeholder="/assets/slide-1.jpg or data:image/..."
                      className="font-mono text-sm flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => browseImage(link.id)}
                      title="Browse Image"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => uploadToAssets(link.id)}
                      title="Upload Image"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => testImageUrl(link.url)}
                      title="Test URL"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter URL, browse local file, or upload image
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Fallback URL (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={link.fallbackUrl || ''}
                      onChange={(e) => updateLink(link.id, 'fallbackUrl', e.target.value)}
                      placeholder="https://images.unsplash.com/photo-... or browse file"
                      className="font-mono text-sm flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const dataUrl = e.target?.result as string;
                            updateLink(link.id, 'fallbackUrl', dataUrl);
                          };
                          reader.readAsDataURL(file);
                        };
                        input.click();
                      }}
                      title="Browse Fallback Image"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </Button>
                    {link.fallbackUrl && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => testImageUrl(link.fallbackUrl!)}
                        title="Test URL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used when primary image fails to load
                  </p>
                </div>

                {/* Image Preview */}
                <div className="relative w-full h-32 bg-muted rounded overflow-hidden">
                  <img
                    src={link.url}
                    alt={`Slide ${link.slideNumber}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (link.fallbackUrl) {
                        e.currentTarget.src = link.fallbackUrl;
                      }
                    }}
                  />
                </div>
              </div>
            ))}

            <Button
              onClick={addNewLink}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Slide Image
            </Button>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Check className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
