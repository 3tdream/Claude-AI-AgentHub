import { create } from 'zustand';
import { userStorage, UserProfile, UserSettings, UserProgress, XP_LEVELS } from '../utils/userStorage';

// User store state interface
interface UserState {
  profile: UserProfile;
  settings: UserSettings;
  progress: UserProgress;
  isInitialized: boolean;

  // Actions
  initialize: () => void;
  updateUsername: (username: string) => void;
  updateAvatar: (avatar: number) => void;
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => boolean;
  addGems: (amount: number) => void;
  removeGems: (amount: number) => boolean;
  addXP: (amount: number) => { newLevel: boolean; level: number };
  updateSettings: (settings: Partial<UserSettings>) => void;
  unlockMode: (modeId: string) => boolean;
  unlockSkin: (skinId: string) => boolean;
  unlockTheme: (themeId: string) => boolean;
  equipSkin: (skinId: string) => boolean;
  equipTheme: (themeId: string) => boolean;
  completeTutorial: () => void;
  completeChallenge: (challengeId: string) => void;
  claimDailyReward: () => { coins: number; streak: number };
  addPlayTime: (seconds: number) => void;
  resetAll: () => void;

  // Computed
  getXPToNextLevel: () => number;
  getLevelProgress: () => number;
}

// Create the Zustand store
export const useUserStore = create<UserState>((set, get) => ({
  profile: userStorage.getProfile(),
  settings: userStorage.getSettings(),
  progress: userStorage.getProgress(),
  isInitialized: false,

  // Initialize user data
  initialize: () => {
    const userData = userStorage.initialize();
    set({
      profile: userData.profile,
      settings: userData.settings,
      progress: userData.progress,
      isInitialized: true,
    });
  },

  // Profile updates
  updateUsername: (username: string) => {
    const newProfile = { ...get().profile, username };
    userStorage.saveProfile(newProfile);
    set({ profile: newProfile });
  },

  updateAvatar: (avatar: number) => {
    const newProfile = { ...get().profile, avatar };
    userStorage.saveProfile(newProfile);
    set({ profile: newProfile });
  },

  // Currency management
  addCoins: (amount: number) => {
    const newCoins = userStorage.addCoins(amount);
    set({ profile: { ...get().profile, coins: newCoins } });
  },

  removeCoins: (amount: number) => {
    const success = userStorage.removeCoins(amount);
    if (success) {
      set({ profile: userStorage.getProfile() });
    }
    return success;
  },

  addGems: (amount: number) => {
    const newGems = userStorage.addGems(amount);
    set({ profile: { ...get().profile, gems: newGems } });
  },

  removeGems: (amount: number) => {
    const success = userStorage.removeGems(amount);
    if (success) {
      set({ profile: userStorage.getProfile() });
    }
    return success;
  },

  // XP and Leveling
  addXP: (amount: number) => {
    const result = userStorage.addXP(amount);
    set({ profile: userStorage.getProfile() });
    return result;
  },

  // Settings
  updateSettings: (updates: Partial<UserSettings>) => {
    userStorage.updateSettings(updates);
    set({ settings: userStorage.getSettings() });
  },

  // Unlocks
  unlockMode: (modeId: string) => {
    const success = userStorage.unlockMode(modeId);
    if (success) {
      set({ progress: userStorage.getProgress() });
    }
    return success;
  },

  unlockSkin: (skinId: string) => {
    const success = userStorage.unlockSkin(skinId);
    if (success) {
      set({ progress: userStorage.getProgress() });
    }
    return success;
  },

  unlockTheme: (themeId: string) => {
    const success = userStorage.unlockTheme(themeId);
    if (success) {
      set({ progress: userStorage.getProgress() });
    }
    return success;
  },

  // Equip
  equipSkin: (skinId: string) => {
    const success = userStorage.equipSkin(skinId);
    if (success) {
      set({ progress: userStorage.getProgress() });
    }
    return success;
  },

  equipTheme: (themeId: string) => {
    const success = userStorage.equipTheme(themeId);
    if (success) {
      set({ progress: userStorage.getProgress() });
    }
    return success;
  },

  // Tutorial
  completeTutorial: () => {
    userStorage.updateProgress({ completedTutorial: true });
    set({ progress: userStorage.getProgress() });
  },

  // Challenges
  completeChallenge: (challengeId: string) => {
    const progress = get().progress;
    if (!progress.completedChallenges.includes(challengeId)) {
      const newCompleted = [...progress.completedChallenges, challengeId];
      userStorage.updateProgress({ completedChallenges: newCompleted });
      set({ progress: userStorage.getProgress() });
    }
  },

  // Daily Reward
  claimDailyReward: () => {
    const progress = get().progress;
    const today = new Date().toISOString().split('T')[0];

    let streak = progress.dailyRewardStreak;
    let coins = 0;

    if (progress.lastDailyReward) {
      const lastClaim = new Date(progress.lastDailyReward);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Check if claimed yesterday (streak continues) or earlier (streak resets)
      if (lastClaim.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        streak += 1;
      } else if (lastClaim.toISOString().split('T')[0] !== today) {
        streak = 1; // Reset streak
      } else {
        // Already claimed today
        return { coins: 0, streak: 0 };
      }
    } else {
      streak = 1; // First claim
    }

    // Calculate reward based on streak
    // Day 1: 50, Day 2: 75, Day 3: 100, ..., Day 7+: 500
    coins = Math.min(500, 50 + (streak - 1) * 25);

    // Bonus gems every 7 days
    if (streak % 7 === 0) {
      get().addGems(10);
    }

    // Update progress
    userStorage.updateProgress({
      lastDailyReward: today,
      dailyRewardStreak: streak,
    });

    // Add coins
    get().addCoins(coins);

    set({ progress: userStorage.getProgress() });

    return { coins, streak };
  },

  // Play time
  addPlayTime: (seconds: number) => {
    const profile = get().profile;
    const newProfile = { ...profile, totalPlayTime: profile.totalPlayTime + seconds };
    userStorage.saveProfile(newProfile);
    set({ profile: newProfile });
  },

  // Reset
  resetAll: () => {
    userStorage.resetAllData();
    const userData = userStorage.getUserData();
    if (userData) {
      set({
        profile: userData.profile,
        settings: userData.settings,
        progress: userData.progress,
      });
    }
  },

  // Computed values
  getXPToNextLevel: () => {
    const { profile } = get();
    return XP_LEVELS.getXPToNextLevel(profile.xp, profile.level);
  },

  getLevelProgress: () => {
    const { profile } = get();
    return XP_LEVELS.getProgressToNextLevel(profile.xp, profile.level);
  },
}));

// Initialize on module load
if (typeof window !== 'undefined') {
  useUserStore.getState().initialize();
}

export default useUserStore;
