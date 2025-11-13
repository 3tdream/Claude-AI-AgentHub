// User Storage - Manages user profile, currency, and progression
// Uses localStorage for now, prepared for cloud sync later

export interface UserProfile {
  userId: string;
  username: string;
  avatar: number; // Index to avatar list
  level: number;
  xp: number;
  coins: number;
  gems: number;
  createdAt: string;
  lastLoginAt: string;
  totalPlayTime: number; // in seconds
}

export interface UserSettings {
  soundVolume: number; // 0-100
  musicVolume: number; // 0-100
  sfxVolume: number; // 0-100
  vibration: boolean;
  controlScheme: 'auto' | 'touch' | 'keyboard' | 'onscreen';
  particleQuality: 'low' | 'medium' | 'high';
  shadowQuality: 'off' | 'low' | 'high';
  showHints: boolean;
  autoPause: boolean;
}

export interface UserProgress {
  unlockedModes: string[]; // Game mode IDs
  unlockedSkins: string[]; // Skin IDs
  unlockedThemes: string[]; // Theme IDs
  equippedSkin: string | null;
  equippedTheme: string | null;
  lastDailyReward: string | null; // ISO date
  dailyRewardStreak: number;
  completedChallenges: string[]; // Challenge IDs
  completedTutorial: boolean;
}

export interface UserData {
  profile: UserProfile;
  settings: UserSettings;
  progress: UserProgress;
}

// Storage keys
const STORAGE_KEYS = {
  USER_DATA: 'snake3d_user_data',
  USER_PROFILE: 'snake3d_user_profile',
  USER_SETTINGS: 'snake3d_user_settings',
  USER_PROGRESS: 'snake3d_user_progress',
};

// Default values
const DEFAULT_PROFILE: UserProfile = {
  userId: generateUserId(),
  username: 'Player',
  avatar: 0,
  level: 1,
  xp: 0,
  coins: 100, // Starting coins
  gems: 0,
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  totalPlayTime: 0,
};

const DEFAULT_SETTINGS: UserSettings = {
  soundVolume: 80,
  musicVolume: 60,
  sfxVolume: 80,
  vibration: true,
  controlScheme: 'auto',
  particleQuality: 'high',
  shadowQuality: 'high',
  showHints: true,
  autoPause: false,
};

const DEFAULT_PROGRESS: UserProgress = {
  unlockedModes: ['classic'], // Classic mode unlocked by default
  unlockedSkins: ['default'],
  unlockedThemes: ['default'],
  equippedSkin: 'default',
  equippedTheme: 'default',
  lastDailyReward: null,
  dailyRewardStreak: 0,
  completedChallenges: [],
  completedTutorial: false,
};

// Helper: Generate unique user ID
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// XP Level System
export const XP_LEVELS = {
  getXPForLevel(level: number): number {
    // Exponential growth: 100 * (level ^ 1.5)
    return Math.floor(100 * Math.pow(level, 1.5));
  },

  getLevelFromXP(xp: number): number {
    let level = 1;
    while (xp >= this.getXPForLevel(level + 1)) {
      level++;
    }
    return level;
  },

  getXPToNextLevel(currentXP: number, currentLevel: number): number {
    const nextLevelXP = this.getXPForLevel(currentLevel + 1);
    return nextLevelXP - currentXP;
  },

  getProgressToNextLevel(currentXP: number, currentLevel: number): number {
    const currentLevelXP = this.getXPForLevel(currentLevel);
    const nextLevelXP = this.getXPForLevel(currentLevel + 1);
    const progress = (currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP);
    return Math.max(0, Math.min(1, progress));
  },
};

// User Storage Manager
export const userStorage = {
  // Initialize user data (call on app start)
  initialize(): UserData {
    const stored = this.getUserData();
    if (!stored) {
      // New user - create default data
      const userData: UserData = {
        profile: { ...DEFAULT_PROFILE },
        settings: { ...DEFAULT_SETTINGS },
        progress: { ...DEFAULT_PROGRESS },
      };
      this.saveUserData(userData);
      return userData;
    }

    // Update last login
    stored.profile.lastLoginAt = new Date().toISOString();
    this.saveProfile(stored.profile);

    return stored;
  },

  // Get complete user data
  getUserData(): UserData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    return null;
  },

  // Save complete user data
  saveUserData(data: UserData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },

  // Profile methods
  getProfile(): UserProfile {
    const data = this.getUserData();
    return data?.profile || { ...DEFAULT_PROFILE };
  },

  saveProfile(profile: UserProfile): void {
    const data = this.getUserData() || {
      profile: { ...DEFAULT_PROFILE },
      settings: { ...DEFAULT_SETTINGS },
      progress: { ...DEFAULT_PROGRESS },
    };
    data.profile = profile;
    this.saveUserData(data);
  },

  updateProfile(updates: Partial<UserProfile>): void {
    const profile = this.getProfile();
    this.saveProfile({ ...profile, ...updates });
  },

  // Settings methods
  getSettings(): UserSettings {
    const data = this.getUserData();
    return data?.settings || { ...DEFAULT_SETTINGS };
  },

  saveSettings(settings: UserSettings): void {
    const data = this.getUserData() || {
      profile: { ...DEFAULT_PROFILE },
      settings: { ...DEFAULT_SETTINGS },
      progress: { ...DEFAULT_PROGRESS },
    };
    data.settings = settings;
    this.saveUserData(data);
  },

  updateSettings(updates: Partial<UserSettings>): void {
    const settings = this.getSettings();
    this.saveSettings({ ...settings, ...updates });
  },

  // Progress methods
  getProgress(): UserProgress {
    const data = this.getUserData();
    return data?.progress || { ...DEFAULT_PROGRESS };
  },

  saveProgress(progress: UserProgress): void {
    const data = this.getUserData() || {
      profile: { ...DEFAULT_PROFILE },
      settings: { ...DEFAULT_SETTINGS },
      progress: { ...DEFAULT_PROGRESS },
    };
    data.progress = progress;
    this.saveUserData(data);
  },

  updateProgress(updates: Partial<UserProgress>): void {
    const progress = this.getProgress();
    this.saveProgress({ ...progress, ...updates });
  },

  // Currency methods
  addCoins(amount: number): number {
    const profile = this.getProfile();
    profile.coins += amount;
    this.saveProfile(profile);
    return profile.coins;
  },

  removeCoins(amount: number): boolean {
    const profile = this.getProfile();
    if (profile.coins >= amount) {
      profile.coins -= amount;
      this.saveProfile(profile);
      return true;
    }
    return false;
  },

  addGems(amount: number): number {
    const profile = this.getProfile();
    profile.gems += amount;
    this.saveProfile(profile);
    return profile.gems;
  },

  removeGems(amount: number): boolean {
    const profile = this.getProfile();
    if (profile.gems >= amount) {
      profile.gems -= amount;
      this.saveProfile(profile);
      return true;
    }
    return false;
  },

  // XP and Level methods
  addXP(amount: number): { newLevel: boolean; level: number } {
    const profile = this.getProfile();
    const oldLevel = profile.level;
    profile.xp += amount;
    profile.level = XP_LEVELS.getLevelFromXP(profile.xp);
    this.saveProfile(profile);

    return {
      newLevel: profile.level > oldLevel,
      level: profile.level,
    };
  },

  // Unlock methods
  unlockMode(modeId: string): boolean {
    const progress = this.getProgress();
    if (!progress.unlockedModes.includes(modeId)) {
      progress.unlockedModes.push(modeId);
      this.saveProgress(progress);
      return true;
    }
    return false;
  },

  unlockSkin(skinId: string): boolean {
    const progress = this.getProgress();
    if (!progress.unlockedSkins.includes(skinId)) {
      progress.unlockedSkins.push(skinId);
      this.saveProgress(progress);
      return true;
    }
    return false;
  },

  unlockTheme(themeId: string): boolean {
    const progress = this.getProgress();
    if (!progress.unlockedThemes.includes(themeId)) {
      progress.unlockedThemes.push(themeId);
      this.saveProgress(progress);
      return true;
    }
    return false;
  },

  // Equip methods
  equipSkin(skinId: string): boolean {
    const progress = this.getProgress();
    if (progress.unlockedSkins.includes(skinId)) {
      progress.equippedSkin = skinId;
      this.saveProgress(progress);
      return true;
    }
    return false;
  },

  equipTheme(themeId: string): boolean {
    const progress = this.getProgress();
    if (progress.unlockedThemes.includes(themeId)) {
      progress.equippedTheme = themeId;
      this.saveProgress(progress);
      return true;
    }
    return false;
  },

  // Reset methods
  resetAllData(): void {
    const confirm = window.confirm(
      'Are you sure you want to reset all your data? This action cannot be undone!'
    );
    if (confirm) {
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      this.initialize();
    }
  },

  // Export/Import for backup (future cloud sync)
  exportData(): string {
    const data = this.getUserData();
    return JSON.stringify(data, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString) as UserData;
      this.saveUserData(data);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },
};

export default userStorage;
