import { useState } from 'react';

export interface ShareState {
  copied: boolean;
  handleShare: () => Promise<void>;
}

export function useShare(): ShareState {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'AIkinsey - Autonomous AI Workforce',
      text: 'Check out this AIkinsey investor pitch deck',
      url: window.location.href,
    };

    try {
      // Try to use native share API if available
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      // If share is cancelled or fails, try clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (clipboardError) {
        console.error('Failed to share:', error);
      }
    }
  };

  return { copied, handleShare };
}
