/**
 * Voice command processor
 * Integrates speech-to-text with NLP pipeline
 */

import { recognizeSpeech, isSpeechRecognitionAvailable, type MockAudioInput } from './speech-to-text.js';
import { handleUserText } from '../nlp/index.js';
import type { VoiceCommandResult, RecognitionOptions } from './types.js';
import type { AgentAction } from '../core/types.js';

/**
 * Process voice command from audio input
 * Pipeline: Audio → Speech-to-Text → NLP → Actions
 */
export async function processVoiceCommand(
  audioInput: MockAudioInput,
  options?: RecognitionOptions
): Promise<{
  voiceResult: VoiceCommandResult;
  actions: AgentAction[];
}> {
  // Step 1: Check if speech recognition is available
  if (!isSpeechRecognitionAvailable()) {
    throw new Error('Speech recognition is not available');
  }

  // Step 2: Convert speech to text
  const speechResult = await recognizeSpeech(audioInput, options);

  if (!speechResult.text || speechResult.text.trim().length === 0) {
    throw new Error('No speech detected in audio input');
  }

  // Step 3: Process text through NLP to get actions
  const actions = await handleUserText(speechResult.text);

  // Step 4: Build voice command result
  const voiceResult: VoiceCommandResult = {
    text: speechResult.text,
    confidence: speechResult.confidence || 0,
    processedAt: new Date().toISOString(),
    audioSource: typeof audioInput === 'string' ? audioInput : 'audio-buffer',
  };

  return {
    voiceResult,
    actions,
  };
}

/**
 * Process voice command with text fallback
 * If speech recognition fails, falls back to direct text input
 */
export async function processVoiceCommandWithFallback(
  audioInput: MockAudioInput,
  fallbackText?: string,
  options?: RecognitionOptions
): Promise<{
  voiceResult: VoiceCommandResult;
  actions: AgentAction[];
  usedFallback: boolean;
}> {
  try {
    const result = await processVoiceCommand(audioInput, options);
    return { ...result, usedFallback: false };
  } catch (error) {
    // Fall back to text input if provided
    if (fallbackText) {
      const actions = await handleUserText(fallbackText);
      return {
        voiceResult: {
          text: fallbackText,
          confidence: 1.0, // Perfect confidence for manual input
          processedAt: new Date().toISOString(),
          audioSource: 'text-fallback',
        },
        actions,
        usedFallback: true,
      };
    }

    // Re-throw if no fallback available
    throw error;
  }
}

/**
 * Validate voice command confidence threshold
 */
export function isVoiceCommandConfident(
  voiceResult: VoiceCommandResult,
  threshold = 0.7
): boolean {
  return voiceResult.confidence >= threshold;
}

/**
 * Get voice processing statistics
 */
export function getVoiceStats(voiceResult: VoiceCommandResult): {
  wordCount: number;
  avgConfidence: number;
  duration?: number;
} {
  const words = voiceResult.text.trim().split(/\s+/);
  return {
    wordCount: words.length,
    avgConfidence: voiceResult.confidence,
  };
}
