// Types for game statistics
export interface GameStats {
  playerName: string;
  totalGamesPlayed: number;
  totalScore: number;
  bestStreak: number;
  powerUpsCollected: number;
  achievements: string[];
}

export interface HighScore {
  id: string;
  playerName: string;
  score: number;
  difficulty: string;
  date: string;
  timestamp: number;
}

// LocalStorage keys
const STORAGE_KEYS = {
  STATS: 'snake3d_stats',
  HIGH_SCORES: 'snake3d_highscores',
  PLAYER_NAME: 'snake3d_player_name',
};

// Initialize default stats
const DEFAULT_STATS: GameStats = {
  playerName: 'AAA',
  totalGamesPlayed: 0,
  totalScore: 0,
  bestStreak: 0,
  powerUpsCollected: 0,
  achievements: [],
};

// Stats Storage Functions
export const statsStorage = {
  // Get player stats
  getStats(): GameStats {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STATS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    return { ...DEFAULT_STATS };
  },

  // Save player stats
  saveStats(stats: GameStats): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  },

  // Update specific stat
  updateStat<K extends keyof GameStats>(key: K, value: GameStats[K]): void {
    const stats = this.getStats();
    stats[key] = value;
    this.saveStats(stats);
  },

  // Increment a numeric stat
  incrementStat(key: keyof GameStats, amount: number = 1): void {
    const stats = this.getStats();
    const currentValue = stats[key];
    if (typeof currentValue === 'number') {
      (stats[key] as number) = currentValue + amount;
      this.saveStats(stats);
    }
  },

  // Add achievement
  addAchievement(achievement: string): boolean {
    const stats = this.getStats();
    if (!stats.achievements.includes(achievement)) {
      stats.achievements.push(achievement);
      this.saveStats(stats);
      return true; // New achievement unlocked!
    }
    return false; // Already had this achievement
  },

  // Reset all stats
  resetStats(): void {
    this.saveStats({ ...DEFAULT_STATS });
  },

  // Get high scores
  getHighScores(limit: number = 10): HighScore[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
      if (stored) {
        const scores: HighScore[] = JSON.parse(stored);
        return scores
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
      }
    } catch (error) {
      console.error('Error loading high scores:', error);
    }
    return [];
  },

  // Add high score
  addHighScore(score: number, difficulty: string): boolean {
    try {
      const stats = this.getStats();
      const newScore: HighScore = {
        id: Date.now().toString(),
        playerName: stats.playerName || 'AAA',
        score,
        difficulty,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now(),
      };

      const scores = this.getHighScores(100); // Get all scores
      scores.push(newScore);
      scores.sort((a, b) => b.score - a.score);

      localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(scores));

      // Check if this is a new top 10 score
      const top10 = scores.slice(0, 10);
      return top10.some(s => s.id === newScore.id);
    } catch (error) {
      console.error('Error adding high score:', error);
      return false;
    }
  },

  // Get high scores by difficulty
  getHighScoresByDifficulty(difficulty: string, limit: number = 10): HighScore[] {
    const allScores = this.getHighScores(100);
    return allScores
      .filter(score => score.difficulty === difficulty)
      .slice(0, limit);
  },

  // Check if score makes top 10
  isTopScore(score: number): boolean {
    const top10 = this.getHighScores(10);
    if (top10.length < 10) return true;
    return score > top10[top10.length - 1].score;
  },

  // Get rank for a score
  getScoreRank(score: number): number {
    const scores = this.getHighScores(100);
    const rank = scores.filter(s => s.score > score).length + 1;
    return rank;
  },

  // Clear all high scores
  clearHighScores(): void {
    localStorage.removeItem(STORAGE_KEYS.HIGH_SCORES);
  },

  // Get/Set player name
  getPlayerName(): string {
    try {
      const stats = this.getStats();
      return stats.playerName || 'AAA';
    } catch (error) {
      return 'AAA';
    }
  },

  setPlayerName(name: string): void {
    const sanitized = name.toUpperCase().slice(0, 3).padEnd(3, 'A');
    this.updateStat('playerName', sanitized);
  },
};

// Achievement definitions
export const ACHIEVEMENTS = {
  FIRST_WIN: {
    id: 'first_win',
    name: 'First Victory',
    description: 'Complete your first game',
    icon: '🏆',
  },
  SCORE_100: {
    id: 'score_100',
    name: 'Centurion',
    description: 'Reach a score of 100',
    icon: '💯',
  },
  SCORE_500: {
    id: 'score_500',
    name: 'Score Master',
    description: 'Reach a score of 500',
    icon: '🌟',
  },
  SCORE_1000: {
    id: 'score_1000',
    name: 'Legend',
    description: 'Reach a score of 1000',
    icon: '👑',
  },
  GAMES_10: {
    id: 'games_10',
    name: 'Dedicated',
    description: 'Play 10 games',
    icon: '🎮',
  },
  GAMES_50: {
    id: 'games_50',
    name: 'Veteran',
    description: 'Play 50 games',
    icon: '🎯',
  },
  GAMES_100: {
    id: 'games_100',
    name: 'Arcade Master',
    description: 'Play 100 games',
    icon: '🕹️',
  },
  POWERUP_COLLECTOR: {
    id: 'powerup_collector',
    name: 'Power Collector',
    description: 'Collect 50 power-ups',
    icon: '⚡',
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a game on Expert difficulty',
    icon: '🚀',
  },
  PERFECT_SCORE: {
    id: 'perfect_score',
    name: 'Perfectionist',
    description: 'Get a score ending in 000',
    icon: '✨',
  },
};

// Check for achievements based on game performance
export function checkAchievements(score: number, difficulty: string, _powerUps: number): string[] {
  const newAchievements: string[] = [];
  const stats = statsStorage.getStats();

  // Score-based achievements
  if (score >= 100 && statsStorage.addAchievement(ACHIEVEMENTS.SCORE_100.id)) {
    newAchievements.push(ACHIEVEMENTS.SCORE_100.id);
  }
  if (score >= 500 && statsStorage.addAchievement(ACHIEVEMENTS.SCORE_500.id)) {
    newAchievements.push(ACHIEVEMENTS.SCORE_500.id);
  }
  if (score >= 1000 && statsStorage.addAchievement(ACHIEVEMENTS.SCORE_1000.id)) {
    newAchievements.push(ACHIEVEMENTS.SCORE_1000.id);
  }

  // Games played achievements
  if (stats.totalGamesPlayed >= 10 && statsStorage.addAchievement(ACHIEVEMENTS.GAMES_10.id)) {
    newAchievements.push(ACHIEVEMENTS.GAMES_10.id);
  }
  if (stats.totalGamesPlayed >= 50 && statsStorage.addAchievement(ACHIEVEMENTS.GAMES_50.id)) {
    newAchievements.push(ACHIEVEMENTS.GAMES_50.id);
  }
  if (stats.totalGamesPlayed >= 100 && statsStorage.addAchievement(ACHIEVEMENTS.GAMES_100.id)) {
    newAchievements.push(ACHIEVEMENTS.GAMES_100.id);
  }

  // Power-up achievements
  if (stats.powerUpsCollected >= 50 && statsStorage.addAchievement(ACHIEVEMENTS.POWERUP_COLLECTOR.id)) {
    newAchievements.push(ACHIEVEMENTS.POWERUP_COLLECTOR.id);
  }

  // Difficulty achievements
  if (difficulty === 'EXPERT' && statsStorage.addAchievement(ACHIEVEMENTS.SPEED_DEMON.id)) {
    newAchievements.push(ACHIEVEMENTS.SPEED_DEMON.id);
  }

  // Special achievements
  if (score % 1000 === 0 && score > 0 && statsStorage.addAchievement(ACHIEVEMENTS.PERFECT_SCORE.id)) {
    newAchievements.push(ACHIEVEMENTS.PERFECT_SCORE.id);
  }

  // First win
  if (stats.totalGamesPlayed === 1 && statsStorage.addAchievement(ACHIEVEMENTS.FIRST_WIN.id)) {
    newAchievements.push(ACHIEVEMENTS.FIRST_WIN.id);
  }

  return newAchievements;
}

export default statsStorage;
