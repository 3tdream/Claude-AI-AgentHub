"use client";

import { useState, useRef, useEffect } from "react";
import { Music, Upload, Play, Pause, Check, X, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AudioFile {
  name: string;
  url: string;
  duration?: number;
}

export function AudioManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for existing audio files on mount
  useEffect(() => {
    checkExistingAudioFiles();
  }, []);

  const checkExistingAudioFiles = async () => {
    const files: AudioFile[] = [];
    const commonFiles = [
      '/audio/background-music.mp3',
      '/audio/background-music.ogg',
      '/audio/background-music.wav',
    ];

    for (const url of commonFiles) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          files.push({
            name: url.split('/').pop() || url,
            url,
          });
        }
      } catch (e) {
        // File doesn't exist, skip
      }
    }

    setAudioFiles(files);
    if (files.length > 0 && !currentAudio) {
      setCurrentAudio(files[0].url);
      setSelectedFile(files[0].url);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an audio file
    if (!file.type.startsWith('audio/')) {
      toast.error('Please select an audio file (MP3, OGG, WAV)');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Create a temporary URL for preview
    const url = URL.createObjectURL(file);
    const newFile: AudioFile = {
      name: file.name,
      url,
    };

    setAudioFiles((prev) => [...prev, newFile]);
    setSelectedFile(url);
    toast.success(`Added ${file.name} for preview`);
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const playPreview = (url: string) => {
    if (audioRef.current) {
      if (currentAudio === url && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.src = url;
        audioRef.current.play();
        setCurrentAudio(url);
        setIsPlaying(true);
      }
    }
  };

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleSelectFile = (url: string) => {
    setSelectedFile(url);
    toast.success('Audio file selected');
  };

  const handleSave = () => {
    if (!selectedFile) {
      toast.error('Please select an audio file');
      return;
    }

    // Save the selected audio file to localStorage
    localStorage.setItem('background-audio', selectedFile);
    toast.success('Audio settings saved! Reload to apply changes.');

    // Emit custom event to notify parent component
    window.dispatchEvent(new CustomEvent('audio-updated', {
      detail: { url: selectedFile }
    }));

    setIsOpen(false);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md"
            title="Audio Manager"
          >
            <Music className="w-5 h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audio Manager</DialogTitle>
            <DialogDescription>
              Manage background music for your presentation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Current Audio Status */}
            <div className="p-4 bg-muted rounded-lg">
              <Label className="text-sm font-semibold mb-2 block">
                Current Status
              </Label>
              <div className="flex items-center gap-2 text-sm">
                {audioFiles.length > 0 ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{audioFiles.length} audio file(s) found</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-yellow-500" />
                    <span>No audio files found in /public/audio/</span>
                  </>
                )}
              </div>
            </div>

            {/* File Browser */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Audio Files</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBrowseFiles}
                    className="flex items-center gap-2"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Browse Files
                  </Button>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Audio Files List */}
              <div className="space-y-2 bg-muted p-3 rounded-lg max-h-60 overflow-y-auto">
                {audioFiles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No audio files found</p>
                    <p className="text-xs mt-1">
                      Click &quot;Browse Files&quot; to add audio
                    </p>
                  </div>
                ) : (
                  audioFiles.map((file) => (
                    <div
                      key={file.url}
                      className={`flex items-center gap-3 bg-background p-3 rounded-md transition-colors ${
                        selectedFile === file.url
                          ? 'ring-2 ring-primary'
                          : ''
                      }`}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => playPreview(file.url)}
                      >
                        {currentAudio === file.url && isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        {file.duration && (
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(file.duration)}
                          </p>
                        )}
                      </div>

                      <Button
                        variant={selectedFile === file.url ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSelectFile(file.url)}
                      >
                        {selectedFile === file.url ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Selected
                          </>
                        ) : (
                          'Select'
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                How to Add Audio Files
              </h4>
              <ol className="text-xs text-muted-foreground space-y-1 ml-4 list-decimal">
                <li>Click &quot;Browse Files&quot; to select an audio file</li>
                <li>Or place audio files in <code className="bg-muted px-1 py-0.5 rounded">public/audio/</code></li>
                <li>Supported formats: MP3, OGG, WAV</li>
                <li>Recommended: background-music.mp3</li>
                <li>Max file size: 10MB</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleSave}
                className="flex-1"
                disabled={!selectedFile}
              >
                Save Settings
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  stopPreview();
                  setIsOpen(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden audio element for preview */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onLoadedMetadata={(e) => {
          const audio = e.target as HTMLAudioElement;
          const url = audio.src;
          setAudioFiles((prev) =>
            prev.map((file) =>
              file.url === url
                ? { ...file, duration: audio.duration }
                : file
            )
          );
        }}
      />
    </>
  );
}
