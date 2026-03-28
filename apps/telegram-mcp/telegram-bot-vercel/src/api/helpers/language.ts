/**
 * Multilingual Support Module
 * Supports: English (en), Russian (ru), Hebrew (he)
 */

import { franc } from "franc-min";

// ==================== TYPES ====================

export type SupportedLanguage = "en" | "ru" | "he" | "unknown";

export interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: number;
}

// ==================== LANGUAGE DETECTION ====================

/**
 * Detect the language of a text
 * Uses franc-min for fast detection
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  // franc returns ISO 639-3 codes, we need to map to our codes
  const francCode = franc(text, { minLength: 2 });

  const languageMap: Record<string, SupportedLanguage> = {
    eng: "en",
    rus: "ru",
    heb: "he",
  };

  const language = languageMap[francCode] || "unknown";

  // Simple confidence based on text characteristics
  let confidence = 0.7;

  // Hebrew has unique characters
  if (/[\u0590-\u05FF]/.test(text)) {
    return { language: "he", confidence: 0.95 };
  }

  // Russian/Cyrillic has unique characters
  if (/[\u0400-\u04FF]/.test(text)) {
    return { language: "ru", confidence: 0.95 };
  }

  // Default to English for Latin characters
  if (/^[a-zA-Z\s\d\p{P}]+$/u.test(text)) {
    return { language: "en", confidence: 0.8 };
  }

  return { language, confidence };
}

// ==================== KEYWORD DICTIONARIES ====================

/**
 * Intent keywords in multiple languages
 * Each keyword maps to an intent type
 */
export const INTENT_KEYWORDS = {
  generate_image: {
    en: [
      "create", "make", "generate", "draw", "paint", "design",
      "show me", "give me", "image", "picture", "photo", "art",
      "illustration", "drawing", "imagine", "visualize", "render",
    ],
    ru: [
      "создай", "сделай", "нарисуй", "сгенерируй", "покажи",
      "картинку", "картинка", "изображение", "фото", "рисунок",
      "арт", "нарисовать", "создать", "визуализируй",
    ],
    he: [
      "צור", "תצור", "צייר", "תצייר", "עשה", "תעשה",
      "תמונה", "ציור", "תמונת", "אמנות", "הדמיה",
    ],
  },

  help: {
    en: [
      "help", "commands", "features", "capabilities", "abilities",
      "what can you do", "how to use", "how do i",
    ],
    ru: [
      "помощь", "помоги", "команды", "функции", "возможности",
      "что умеешь", "что можешь", "как использовать", "как пользоваться",
    ],
    he: [
      "עזרה", "עזור", "פקודות", "תכונות", "יכולות",
      "מה אתה יכול", "איך להשתמש",
    ],
  },

  clear_history: {
    en: [
      "clear", "reset", "forget", "delete", "wipe",
      "history", "conversation", "chat", "memory",
      "start over", "fresh start", "new conversation",
    ],
    ru: [
      "очисти", "удали", "сотри", "забудь", "очистить",
      "историю", "чат", "переписку", "разговор", "память",
      "начни сначала", "заново", "новый разговор",
    ],
    he: [
      "נקה", "מחק", "שכח", "היסטוריה", "שיחה", "צאט",
      "התחל מחדש", "שיחה חדשה",
    ],
  },

  get_stats: {
    en: [
      "stats", "statistics", "usage", "memory", "status",
    ],
    ru: [
      "статистика", "стат", "использование", "память", "статус",
    ],
    he: [
      "סטטיסטיקה", "שימוש", "זיכרון", "סטטוס",
    ],
  },

  admin_command: {
    en: [
      "cleanup", "all users", "list users", "groups", "admin", "broadcast",
    ],
    ru: [
      "очистка", "все пользователи", "пользователи", "группы", "админ",
    ],
    he: [
      "ניקוי", "כל המשתמשים", "משתמשים", "קבוצות", "אדמין",
    ],
  },
};

// ==================== SUBJECT EXTRACTION KEYWORDS ====================

/**
 * Words that indicate "of" or introduce the subject in different languages
 */
export const SUBJECT_INDICATORS = {
  en: ["of", "with", "showing", "featuring", "depicting"],
  ru: ["с", "со", "про", "о", "об"],
  he: ["של", "עם"],
};

/**
 * Words to remove when extracting subject (articles, prepositions, etc.)
 */
export const STOP_WORDS = {
  en: ["a", "an", "the", "me", "my", "please", "can", "you", "i", "want", "need"],
  ru: ["мне", "мой", "моя", "моё", "пожалуйста", "я", "хочу", "нужно", "нужна"],
  he: ["לי", "שלי", "בבקשה", "אני", "רוצה", "צריך"],
};

// ==================== KEYWORD MATCHING ====================

/**
 * Check if text contains any keywords for a specific intent
 */
export function matchesIntent(
  text: string,
  intent: keyof typeof INTENT_KEYWORDS,
  language?: SupportedLanguage
): boolean {
  const lowerText = text.toLowerCase();
  const keywords = INTENT_KEYWORDS[intent];

  // If language specified, only check that language
  if (language && language !== "unknown") {
    const langKeywords = keywords[language] || [];
    return langKeywords.some(kw => lowerText.includes(kw.toLowerCase()));
  }

  // Check all languages
  return Object.values(keywords).flat().some(kw =>
    lowerText.includes(kw.toLowerCase())
  );
}

/**
 * Find the best matching intent for a text
 */
export function findBestIntent(
  text: string
): { intent: keyof typeof INTENT_KEYWORDS | "chat"; score: number } {
  const lowerText = text.toLowerCase();
  let bestIntent: keyof typeof INTENT_KEYWORDS | "chat" = "chat";
  let bestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    const allKeywords = Object.values(keywords).flat();
    const matchCount = allKeywords.filter(kw =>
      lowerText.includes(kw.toLowerCase())
    ).length;

    // Weight by match count and keyword length (longer matches are better)
    const score = allKeywords.reduce((acc, kw) => {
      if (lowerText.includes(kw.toLowerCase())) {
        return acc + kw.length;
      }
      return acc;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent as keyof typeof INTENT_KEYWORDS;
    }
  }

  return { intent: bestIntent, score: bestScore };
}

/**
 * Extract the subject/prompt from user text
 * Removes intent keywords and stop words
 */
export function extractSubject(text: string, language: SupportedLanguage): string {
  let subject = text;

  // Remove image generation keywords
  const imageKeywords = INTENT_KEYWORDS.generate_image;
  const allImageKeywords = Object.values(imageKeywords).flat();

  for (const kw of allImageKeywords) {
    const regex = new RegExp(kw, "gi");
    subject = subject.replace(regex, "");
  }

  // Remove stop words for the detected language
  const stopWords = language !== "unknown" ? STOP_WORDS[language] : STOP_WORDS.en;
  for (const sw of stopWords) {
    const regex = new RegExp(`\\b${sw}\\b`, "gi");
    subject = subject.replace(regex, "");
  }

  // Remove subject indicators
  const indicators = language !== "unknown" ? SUBJECT_INDICATORS[language] : SUBJECT_INDICATORS.en;
  for (const ind of indicators) {
    const regex = new RegExp(`\\b${ind}\\b`, "gi");
    subject = subject.replace(regex, "");
  }

  // Clean up whitespace
  subject = subject.replace(/\s+/g, " ").trim();

  return subject;
}

// ==================== TRANSLATION ====================

// Common translations for image prompts (most common subjects)
// Maps foreign words to English translations
const COMMON_TRANSLATIONS: Record<string, string> = {
  // Animals
  "кошка": "cat", "кошку": "cat", "кот": "cat", "кота": "cat",
  "собака": "dog", "собаку": "dog", "пёс": "dog", "пса": "dog",
  "дракон": "dragon", "дракона": "dragon",
  "лошадь": "horse", "лошадей": "horses",
  "птица": "bird", "птицу": "bird",
  "рыба": "fish", "рыбу": "fish",
  "лев": "lion", "льва": "lion",
  "тигр": "tiger", "тигра": "tiger",
  "медведь": "bear", "медведя": "bear",
  "волк": "wolf", "волка": "wolf",
  "заяц": "rabbit", "зайца": "rabbit", "кролик": "rabbit",
  "слон": "elephant", "слона": "elephant",

  // Hebrew animals
  "חתול": "cat", "כלב": "dog", "דרקון": "dragon",
  "סוס": "horse", "ציפור": "bird", "דג": "fish",
  "אריה": "lion", "נמר": "tiger", "דוב": "bear",
  "זאב": "wolf", "ארנב": "rabbit", "פיל": "elephant",

  // Nature
  "закат": "sunset", "рассвет": "sunrise", "море": "sea",
  "океан": "ocean", "гора": "mountain", "горы": "mountains",
  "лес": "forest", "дерево": "tree", "цветок": "flower",
  "небо": "sky", "солнце": "sun", "луна": "moon",
  "звёзды": "stars", "река": "river", "озеро": "lake",
  "водопад": "waterfall", "пляж": "beach", "пустыня": "desert",

  // Hebrew nature
  "שקיעה": "sunset", "זריחה": "sunrise", "ים": "sea",
  "אוקיינוס": "ocean", "הר": "mountain", "הרים": "mountains",
  "יער": "forest", "עץ": "tree", "פרח": "flower",
  "שמיים": "sky", "שמש": "sun", "ירח": "moon",
  "כוכבים": "stars", "נהר": "river", "אגם": "lake",
  "מפל": "waterfall", "חוף": "beach", "מדבר": "desert",

  // People & Fantasy
  "человек": "person", "женщина": "woman", "мужчина": "man",
  "ребёнок": "child", "девочка": "girl", "мальчик": "boy",
  "воин": "warrior", "рыцарь": "knight", "маг": "wizard",
  "принцесса": "princess", "король": "king", "королева": "queen",
  "ангел": "angel", "демон": "demon", "эльф": "elf",
  "робот": "robot", "инопланетянин": "alien",

  // Hebrew people & fantasy
  "אדם": "person", "אישה": "woman", "גבר": "man",
  "ילד": "child", "ילדה": "girl", "לוחם": "warrior",
  "אביר": "knight", "קוסם": "wizard", "נסיכה": "princess",
  "מלך": "king", "מלכה": "queen", "מלאך": "angel",
  "שד": "demon", "רובוט": "robot",

  // Adjectives
  "красивый": "beautiful", "красивая": "beautiful", "красивое": "beautiful",
  "большой": "big", "большая": "big", "маленький": "small",
  "эпический": "epic", "эпичный": "epic", "волшебный": "magical",
  "древний": "ancient", "футуристический": "futuristic",
  "тёмный": "dark", "светлый": "light", "яркий": "bright",

  // Hebrew adjectives
  "יפה": "beautiful", "גדול": "big", "קטן": "small",
  "אפי": "epic", "קסום": "magical", "עתיק": "ancient",
  "עתידני": "futuristic", "כהה": "dark", "בהיר": "light",

  // Actions/Styles
  "битва": "battle", "бой": "fight", "война": "war",
  "полёт": "flight", "танец": "dance", "сражение": "battle",

  // Hebrew actions
  "קרב": "battle", "מלחמה": "war", "טיסה": "flight", "ריקוד": "dance",
};

/**
 * Translate common words to English using dictionary
 * Falls back to original if not found
 */
export function translateToEnglish(text: string, sourceLanguage: SupportedLanguage): string {
  if (sourceLanguage === "en") {
    return text;
  }

  let translated = text.toLowerCase();

  // Replace known words with English translations
  for (const [foreign, english] of Object.entries(COMMON_TRANSLATIONS)) {
    const regex = new RegExp(`\\b${foreign}\\b`, "gi");
    translated = translated.replace(regex, english);
  }

  return translated;
}

/**
 * Check if text needs translation (contains non-English)
 */
export function needsTranslation(text: string): boolean {
  // Check for Cyrillic (Russian)
  if (/[\u0400-\u04FF]/.test(text)) return true;

  // Check for Hebrew
  if (/[\u0590-\u05FF]/.test(text)) return true;

  return false;
}
