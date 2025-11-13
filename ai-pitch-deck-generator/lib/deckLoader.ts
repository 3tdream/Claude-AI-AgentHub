import { Deck } from '@/types/deck';

/**
 * Loads all pitch decks from individual JSON files
 * This allows AI agents to easily add/modify decks by editing JSON files
 */
export async function loadDecks(): Promise<Deck[]> {
  try {
    // First, fetch the manifest to get list of all decks
    const manifestResponse = await fetch('/decks/manifest.json');
    if (!manifestResponse.ok) {
      throw new Error('Failed to load deck manifest');
    }

    const manifest = await manifestResponse.json();
    const deckPromises = manifest.decks.map(async (deckInfo: any) => {
      const deckResponse = await fetch(`/decks/${deckInfo.filename}`);
      if (!deckResponse.ok) {
        console.warn(`Failed to load deck: ${deckInfo.filename}`);
        return null;
      }
      return deckResponse.json();
    });

    const decks = await Promise.all(deckPromises);
    return decks.filter((deck): deck is Deck => deck !== null);
  } catch (error) {
    console.error('Error loading decks:', error);
    // Fallback to empty array if loading fails
    return [];
  }
}

/**
 * Loads a single deck by filename
 */
export async function loadDeck(filename: string): Promise<Deck | null> {
  try {
    const response = await fetch(`/decks/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load deck: ${filename}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error loading deck ${filename}:`, error);
    return null;
  }
}

/**
 * Gets the deck manifest
 */
export async function getDeckManifest() {
  try {
    const response = await fetch('/decks/manifest.json');
    if (!response.ok) {
      throw new Error('Failed to load deck manifest');
    }
    return response.json();
  } catch (error) {
    console.error('Error loading manifest:', error);
    return { decks: [] };
  }
}
