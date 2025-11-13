import { useEffect, useRef } from 'react';

export interface TouchControlsProps {
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onTap?: () => void;
  minSwipeDistance?: number;
  enabled?: boolean;
}

const TouchControls: React.FC<TouchControlsProps> = ({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  minSwipeDistance = 30,
  enabled = true,
}) => {
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Check if it's a tap (quick touch with minimal movement)
      const isTap = Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 200;

      if (isTap && onTap) {
        onTap();
        return;
      }

      // Check if swipe distance meets minimum threshold
      if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
        return;
      }

      // Determine swipe direction based on which delta is larger
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown();
        } else {
          onSwipeUp();
        }
      }
    };

    // Add touch event listeners
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, onTap, minSwipeDistance, enabled]);

  // This component doesn't render anything - it's just for handling touch events
  return null;
};

export default TouchControls;
