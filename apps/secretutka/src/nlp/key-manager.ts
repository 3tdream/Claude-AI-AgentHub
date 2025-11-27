/**
 * API Key Manager - Handles multiple API keys with rotation and fallback
 */

interface KeyConfig {
  key: string;
  lastUsed: number;
  errorCount: number;
  isActive: boolean;
}

export class ApiKeyManager {
  private keys: KeyConfig[] = [];
  private currentIndex: number = 0;
  private readonly MAX_ERRORS = 3;
  private readonly COOLDOWN_MS = 60000; // 1 minute cooldown after errors

  constructor(apiKeys: string | string[]) {
    // Support both single key (string) and multiple keys (array)
    const keyArray = Array.isArray(apiKeys) ? apiKeys : [apiKeys];

    // Filter out empty keys and initialize
    this.keys = keyArray
      .filter(key => key && key.trim().length > 0)
      .map(key => ({
        key: key.trim(),
        lastUsed: 0,
        errorCount: 0,
        isActive: true,
      }));

    if (this.keys.length === 0) {
      throw new Error('At least one valid API key is required');
    }

    console.log(`✓ Initialized with ${this.keys.length} API key(s)`);
  }

  /**
   * Get the next available API key using round-robin rotation
   */
  getNextKey(): string {
    // Filter active keys that are not in cooldown
    const availableKeys = this.keys.filter(k =>
      k.isActive &&
      (k.errorCount < this.MAX_ERRORS || Date.now() - k.lastUsed > this.COOLDOWN_MS)
    );

    if (availableKeys.length === 0) {
      // All keys are in cooldown or inactive, reset error counts
      console.warn('⚠ All API keys exhausted, resetting error counts');
      this.keys.forEach(k => {
        k.errorCount = 0;
        k.isActive = true;
      });
      return this.keys[0].key;
    }

    // Use round-robin to get next key
    const selectedKey = availableKeys[this.currentIndex % availableKeys.length];
    this.currentIndex = (this.currentIndex + 1) % availableKeys.length;

    selectedKey.lastUsed = Date.now();

    return selectedKey.key;
  }

  /**
   * Report a successful API call (resets error count for that key)
   */
  reportSuccess(usedKey: string): void {
    const keyConfig = this.keys.find(k => k.key === usedKey);
    if (keyConfig) {
      keyConfig.errorCount = 0;
      keyConfig.isActive = true;
    }
  }

  /**
   * Report an API error (increments error count)
   */
  reportError(usedKey: string, error: any): void {
    const keyConfig = this.keys.find(k => k.key === usedKey);
    if (!keyConfig) return;

    keyConfig.errorCount++;
    keyConfig.lastUsed = Date.now();

    // Check if this is a rate limit error
    const isRateLimit =
      error?.status === 429 ||
      error?.error?.type === 'rate_limit_error' ||
      error?.message?.toLowerCase().includes('rate limit');

    if (isRateLimit) {
      console.warn(`⚠ Rate limit hit for key ...${usedKey.slice(-8)}, rotating to next key`);
    }

    if (keyConfig.errorCount >= this.MAX_ERRORS) {
      console.warn(`⚠ Key ...${usedKey.slice(-8)} reached max errors (${this.MAX_ERRORS}), putting in cooldown`);
      keyConfig.isActive = false;
    }
  }

  /**
   * Get statistics about key usage
   */
  getStats(): { total: number; active: number; inactive: number } {
    const active = this.keys.filter(k => k.isActive).length;
    return {
      total: this.keys.length,
      active,
      inactive: this.keys.length - active,
    };
  }
}

/**
 * Load API keys from environment variables
 */
export function loadApiKeys(): ApiKeyManager {
  const keys: string[] = [];

  // Primary key
  if (process.env.ANTHROPIC_API_KEY) {
    keys.push(process.env.ANTHROPIC_API_KEY);
  }

  // Additional keys (ANTHROPIC_API_KEY_2, ANTHROPIC_API_KEY_3, etc.)
  for (let i = 2; i <= 10; i++) {
    const key = process.env[`ANTHROPIC_API_KEY_${i}`];
    if (key) {
      keys.push(key);
    }
  }

  // Alternative: comma-separated keys in ANTHROPIC_API_KEYS
  if (process.env.ANTHROPIC_API_KEYS) {
    const additionalKeys = process.env.ANTHROPIC_API_KEYS.split(',').map(k => k.trim());
    keys.push(...additionalKeys);
  }

  if (keys.length === 0) {
    throw new Error('No API keys found in environment variables. Please set ANTHROPIC_API_KEY or ANTHROPIC_API_KEYS');
  }

  return new ApiKeyManager(keys);
}
