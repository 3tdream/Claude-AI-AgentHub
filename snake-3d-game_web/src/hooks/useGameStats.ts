import { useState, useCallback } from 'react';
import { statsStorage, GameStats, HighScore, checkAchievements } from '../utils/statsStorage';

export function useGameStats() {
  const [stats, setStats] = useState<GameStats>(statsStorage.getStats());
  const [highScores, setHighScores] = useState<HighScore[]>(statsStorage.getHighScores());

  // Refresh stats from storage
  const refreshStats = useCallback(() => {
    setStats(statsStorage.getStats());
    setHighScores(statsStorage.getHighScores());
  }, []);

  // Save game result
  const saveGameResult = useCallback((score: number, difficulty: string, powerUpsCollected: number) => {
    // Update stats
    statsStorage.incrementStat('totalGamesPlayed', 1);
    statsStorage.incrementStat('totalScore', score);
    statsStorage.incrementStat('powerUpsCollected', powerUpsCollected);

    // Update best streak if applicable
    const currentStats = statsStorage.getStats();
    if (score > currentStats.bestStreak) {
      statsStorage.updateStat('bestStreak', score);
    }

    // Add to high scores
    const isNewHighScore = statsStorage.addHighScore(score, difficulty);

    // Check for achievements
    const newAchievements = checkAchievements(score, difficulty, powerUpsCollected);

    // Refresh local state
    refreshStats();

    return {
      isNewHighScore,
      newAchievements,
      rank: statsStorage.getScoreRank(score),
    };
  }, [refreshStats]);

  // Update player name
  const updatePlayerName = useCallback((name: string) => {
    statsStorage.setPlayerName(name);
    refreshStats();
  }, [refreshStats]);

  // Reset stats
  const resetStats = useCallback(() => {
    if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
      statsStorage.resetStats();
      refreshStats();
    }
  }, [refreshStats]);

  // Clear high scores
  const clearHighScores = useCallback(() => {
    if (confirm('Are you sure you want to clear all high scores? This cannot be undone.')) {
      statsStorage.clearHighScores();
      refreshStats();
    }
  }, [refreshStats]);

  // Get high scores by difficulty
  const getHighScoresByDifficulty = useCallback((difficulty: string, limit: number = 10) => {
    return statsStorage.getHighScoresByDifficulty(difficulty, limit);
  }, []);

  // Check if score is a new high
  const isTopScore = useCallback((score: number) => {
    return statsStorage.isTopScore(score);
  }, []);

  // Get current rank for a score
  const getScoreRank = useCallback((score: number) => {
    return statsStorage.getScoreRank(score);
  }, []);

  return {
    stats,
    highScores,
    saveGameResult,
    updatePlayerName,
    resetStats,
    clearHighScores,
    getHighScoresByDifficulty,
    isTopScore,
    getScoreRank,
    refreshStats,
  };
}

export default useGameStats;
