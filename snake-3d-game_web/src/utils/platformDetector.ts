// Platform Detection Utility
// Detects device type and provides platform-specific utilities

export type PlatformType = 'mobile' | 'tablet' | 'desktop';
export type ControlType = 'touch' | 'keyboard' | 'onscreen';

export interface PlatformInfo {
  type: PlatformType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  preferredControl: ControlType;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
}

class PlatformDetector {
  private info: PlatformInfo;

  constructor() {
    this.info = this.detectPlatform();

    // Listen for resize events to update platform info
    window.addEventListener('resize', () => {
      this.info = this.detectPlatform();
    });
  }

  private detectPlatform(): PlatformInfo {
    const userAgent = navigator.userAgent.toLowerCase();
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;

    // Detect mobile devices
    const isMobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);

    // Screen size based detection (more reliable than UA)
    const isMobileScreen = screenWidth < 768;
    const isTabletScreen = screenWidth >= 768 && screenWidth < 1024;

    // Combine UA and screen size detection
    const isMobile = isMobileUA || (isMobileScreen && isTouchDevice);
    const isTablet = isTabletUA || (isTabletScreen && isTouchDevice);
    const isDesktop = !isMobile && !isTablet;

    // Determine platform type
    let type: PlatformType = 'desktop';
    if (isMobile) type = 'mobile';
    else if (isTablet) type = 'tablet';

    // Determine preferred control scheme
    let preferredControl: ControlType = 'keyboard';
    if (isMobile || isTablet) {
      preferredControl = 'touch';
    } else if (isDesktop && isTouchDevice) {
      // Desktop with touch screen - prefer on-screen controls
      preferredControl = 'onscreen';
    }

    return {
      type,
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice,
      preferredControl,
      screenWidth,
      screenHeight,
      pixelRatio,
    };
  }

  public getPlatformInfo(): PlatformInfo {
    return { ...this.info };
  }

  public isMobile(): boolean {
    return this.info.isMobile;
  }

  public isTablet(): boolean {
    return this.info.isTablet;
  }

  public isDesktop(): boolean {
    return this.info.isDesktop;
  }

  public isTouchDevice(): boolean {
    return this.info.isTouchDevice;
  }

  public getPreferredControl(): ControlType {
    return this.info.preferredControl;
  }

  public getScreenSize(): { width: number; height: number } {
    return {
      width: this.info.screenWidth,
      height: this.info.screenHeight,
    };
  }

  public isPortrait(): boolean {
    return this.info.screenHeight > this.info.screenWidth;
  }

  public isLandscape(): boolean {
    return this.info.screenWidth >= this.info.screenHeight;
  }

  public getPixelRatio(): number {
    return this.info.pixelRatio;
  }

  // Check if device supports haptic feedback
  public supportsHaptics(): boolean {
    return 'vibrate' in navigator;
  }

  // Trigger haptic feedback (mobile only)
  public vibrate(pattern: number | number[] = 10): void {
    if (this.supportsHaptics()) {
      navigator.vibrate(pattern);
    }
  }

  // Request fullscreen (useful for mobile games)
  public async requestFullscreen(): Promise<void> {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        await (elem as any).mozRequestFullScreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
    } catch (error) {
      console.warn('Fullscreen request failed:', error);
    }
  }

  // Exit fullscreen
  public async exitFullscreen(): Promise<void> {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.warn('Exit fullscreen failed:', error);
    }
  }

  // Check if currently in fullscreen
  public isFullscreen(): boolean {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }
}

// Export singleton instance
export const platformDetector = new PlatformDetector();

// Export as default
export default platformDetector;
