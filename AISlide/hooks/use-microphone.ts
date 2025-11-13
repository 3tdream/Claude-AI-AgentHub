import { useState, useCallback } from 'react';

export const useMicrophone = (audioStream: MediaStream | null) => {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = useCallback(() => {
    if (audioStream) {
      const tracks = audioStream.getAudioTracks();
      tracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  }, [audioStream, isMuted]);

  return {
    isMuted,
    toggleMute
  };
};
