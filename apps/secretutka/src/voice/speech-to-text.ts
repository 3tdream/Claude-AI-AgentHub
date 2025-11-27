/**
 * Mocked Speech-to-Text service
 * In production, this would integrate with services like:
 * - Google Cloud Speech-to-Text
 * - Azure Speech Services
 * - AWS Transcribe
 * - OpenAI Whisper
 */

import type { SpeechToTextResult, AudioConfig, RecognitionOptions } from './types.js';

/**
 * Mock audio file for testing
 * In production, this would be actual audio data
 */
export type MockAudioInput = string | Buffer | 'microphone' | 'file';

/**
 * Simulate speech recognition with pre-defined test inputs
 * In production, this would call a real STT API
 */
export async function recognizeSpeech(
  audioInput: MockAudioInput,
  options?: RecognitionOptions
): Promise<SpeechToTextResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock responses based on input type
  if (typeof audioInput === 'string') {
    // Check for special mock inputs
    if (audioInput === 'microphone') {
      // Simulated microphone input
      return {
        text: 'Add 8 hours for Acme Corp today at 75 dollars per hour',
        confidence: 0.92,
        language: 'en',
        duration: 3000,
      };
    }

    if (audioInput === 'file') {
      // Simulated file input
      return {
        text: 'Show me summary for January grouped by client',
        confidence: 0.88,
        language: 'en',
        duration: 2500,
      };
    }

    // Direct text input (for testing)
    return {
      text: audioInput,
      confidence: 0.95,
      language: options?.audioConfig?.language || 'en',
      duration: audioInput.length * 100, // Rough estimate
    };
  }

  // Buffer input (binary audio data)
  return {
    text: 'Mark all entries for Tech Inc as paid',
    confidence: 0.90,
    language: 'en',
    duration: 2000,
  };
}

/**
 * Check if speech recognition is available
 * In production, this would check for API credentials
 */
export function isSpeechRecognitionAvailable(): boolean {
  // For mock, always return true
  return true;
}

/**
 * Get supported languages
 * In production, this would query the STT service
 */
export function getSupportedLanguages(): string[] {
  return ['en', 'es', 'fr', 'de', 'he', 'ar'];
}

/**
 * Get recommended audio configuration
 */
export function getRecommendedAudioConfig(): AudioConfig {
  return {
    sampleRate: 16000, // 16kHz is optimal for speech
    channels: 1, // Mono
    encoding: 'wav',
    language: 'en',
  };
}
