import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

export interface BackgroundAudioHandle {
  isMuted: boolean;
  isPlaying: boolean;
  toggleMute: () => void;
}

export const BackgroundAudio = forwardRef<BackgroundAudioHandle>((props, ref) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Try to autoplay when component mounts
    const playAudio = async () => {
      if (audioRef.current) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.log('Autoplay was prevented. User interaction required.');
          setIsPlaying(false);
        }
      }
    };

    playAudio();
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      if (!isPlaying) {
        // If not playing, start playing when user clicks
        audioRef.current.play();
        setIsPlaying(true);
        setIsMuted(false);
      } else {
        // Toggle mute
        audioRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  // Expose state and methods to parent via ref
  useImperativeHandle(ref, () => ({
    isMuted,
    isPlaying,
    toggleMute,
  }));

  return (
    <audio
      ref={audioRef}
      loop
      muted={isMuted}
      className="hidden"
    >
      {/* Local audio file - chill background music */}
      <source src="/audio/background-music.mp3" type="audio/mpeg" />
      <source src="/audio/background-music.ogg" type="audio/ogg" />
      Your browser does not support the audio element.
    </audio>
  );
});
