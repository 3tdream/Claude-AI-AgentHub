/**
 * Voice module types
 */

/**
 * Speech-to-text result
 */
export interface SpeechToTextResult {
  text: string;
  confidence?: number; // 0-1 confidence score
  language?: string;
  duration?: number; // milliseconds
}

/**
 * Audio input configuration
 */
export interface AudioConfig {
  sampleRate?: number; // Hz (e.g., 16000, 44100)
  channels?: number; // 1 for mono, 2 for stereo
  encoding?: 'pcm' | 'wav' | 'mp3' | 'flac';
  language?: string; // ISO 639-1 code (e.g., 'en', 'es')
}

/**
 * Speech recognition options
 */
export interface RecognitionOptions {
  continuous?: boolean; // Keep listening after first result
  interimResults?: boolean; // Return intermediate results
  maxAlternatives?: number; // Max alternative transcriptions
  audioConfig?: AudioConfig;
}

/**
 * Voice command result
 */
export interface VoiceCommandResult {
  text: string;
  confidence: number;
  processedAt: string;
  audioSource?: string;
}
