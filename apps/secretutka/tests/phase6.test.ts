/**
 * Phase 6 Tests: Voice pipeline architecture
 */

import { describe, it, expect } from 'vitest';
import {
  recognizeSpeech,
  isSpeechRecognitionAvailable,
  getSupportedLanguages,
  getRecommendedAudioConfig,
} from '../src/voice/speech-to-text.js';
import {
  processVoiceCommand,
  processVoiceCommandWithFallback,
  isVoiceCommandConfident,
  getVoiceStats,
} from '../src/voice/processor.js';

describe('Phase 6: Voice Pipeline', () => {
  describe('Speech-to-Text', () => {
    it('should recognize speech from microphone input', async () => {
      const result = await recognizeSpeech('microphone');

      expect(result.text).toBeDefined();
      expect(result.text.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.language).toBe('en');
    });

    it('should recognize speech from file input', async () => {
      const result = await recognizeSpeech('file');

      expect(result.text).toBeDefined();
      expect(result.text).toContain('summary');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle direct text input', async () => {
      const testText = 'Add 5 hours for Test Client at $100/hour';
      const result = await recognizeSpeech(testText);

      expect(result.text).toBe(testText);
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should return speech recognition availability', () => {
      const isAvailable = isSpeechRecognitionAvailable();
      expect(isAvailable).toBe(true);
    });

    it('should return supported languages', () => {
      const languages = getSupportedLanguages();
      expect(Array.isArray(languages)).toBe(true);
      expect(languages).toContain('en');
      expect(languages.length).toBeGreaterThan(0);
    });

    it('should return recommended audio config', () => {
      const config = getRecommendedAudioConfig();
      expect(config.sampleRate).toBeDefined();
      expect(config.channels).toBeDefined();
      expect(config.encoding).toBeDefined();
      expect(config.language).toBeDefined();
    });
  });

  describe('Voice Command Processor', () => {
    it.skipIf(!process.env.ANTHROPIC_API_KEY)(
      'should process voice command and return actions',
      async () => {
        const result = await processVoiceCommand('microphone');

        expect(result.voiceResult).toBeDefined();
        expect(result.voiceResult.text).toBeDefined();
        expect(result.voiceResult.confidence).toBeGreaterThan(0);
        expect(result.actions).toBeDefined();
        expect(Array.isArray(result.actions)).toBe(true);
      }
    );

    it.skipIf(!process.env.ANTHROPIC_API_KEY)(
      'should process voice command with fallback',
      async () => {
        const fallbackText = 'Show me all entries';
        const result = await processVoiceCommandWithFallback(
          'microphone',
          fallbackText
        );

        expect(result.voiceResult).toBeDefined();
        expect(result.actions).toBeDefined();
        expect(result.usedFallback).toBe(false); // Should use primary input
      }
    );

    it('should validate voice command confidence', () => {
      const highConfidence = {
        text: 'Test',
        confidence: 0.95,
        processedAt: new Date().toISOString(),
        audioSource: 'test',
      };

      const lowConfidence = {
        text: 'Test',
        confidence: 0.5,
        processedAt: new Date().toISOString(),
        audioSource: 'test',
      };

      expect(isVoiceCommandConfident(highConfidence, 0.7)).toBe(true);
      expect(isVoiceCommandConfident(lowConfidence, 0.7)).toBe(false);
    });

    it('should calculate voice command statistics', () => {
      const voiceResult = {
        text: 'Add 8 hours for Acme Corp',
        confidence: 0.92,
        processedAt: new Date().toISOString(),
        audioSource: 'microphone',
      };

      const stats = getVoiceStats(voiceResult);

      expect(stats.wordCount).toBe(6); // "Add", "8", "hours", "for", "Acme", "Corp" = 6 words
      expect(stats.avgConfidence).toBe(0.92);
    });
  });
});
