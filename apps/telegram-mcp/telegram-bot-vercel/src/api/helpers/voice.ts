/**
 * Voice message transcription using Groq Whisper API
 * Fast and accurate speech-to-text for Telegram voice messages
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ==================== TYPES ====================

export interface TranscriptionResult {
  success: boolean;
  text?: string;
  duration?: number;
  error?: string;
}

// ==================== TELEGRAM FILE HELPERS ====================

/**
 * Get file path from Telegram
 */
async function getTelegramFilePath(fileId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: fileId }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error("[VOICE] Failed to get file path:", data.description);
      return null;
    }

    return data.result.file_path;
  } catch (error) {
    console.error("[VOICE] Error getting file path:", error);
    return null;
  }
}

/**
 * Download file from Telegram as ArrayBuffer
 */
async function downloadTelegramFile(filePath: string): Promise<ArrayBuffer | null> {
  try {
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
    const response = await fetch(fileUrl);

    if (!response.ok) {
      console.error("[VOICE] Failed to download file:", response.status);
      return null;
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error("[VOICE] Error downloading file:", error);
    return null;
  }
}

// ==================== GROQ WHISPER TRANSCRIPTION ====================

/**
 * Transcribe audio using Groq's Whisper API
 * Groq provides fast, free Whisper inference
 */
async function transcribeWithGroq(
  audioBuffer: ArrayBuffer,
  fileName: string
): Promise<TranscriptionResult> {
  if (!GROQ_API_KEY) {
    return {
      success: false,
      error: "GROQ_API_KEY not configured",
    };
  }

  try {
    // Create form data with the audio file
    const formData = new FormData();

    // Convert ArrayBuffer to Blob
    const blob = new Blob([audioBuffer], { type: "audio/ogg" });
    formData.append("file", blob, fileName);
    formData.append("model", "whisper-large-v3");
    formData.append("response_format", "json");

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[VOICE] Groq API error:", response.status, errorText);
      return {
        success: false,
        error: `Groq API error: ${response.status}`,
      };
    }

    const result = await response.json();

    return {
      success: true,
      text: result.text,
      duration: result.duration,
    };
  } catch (error: any) {
    console.error("[VOICE] Groq transcription error:", error);
    return {
      success: false,
      error: error.message || "Transcription failed",
    };
  }
}

// ==================== MAIN TRANSCRIPTION FUNCTION ====================

/**
 * Transcribe a Telegram voice message
 *
 * @param fileId - Telegram file_id of the voice message
 * @returns TranscriptionResult with text or error
 */
export async function transcribeVoiceMessage(
  fileId: string
): Promise<TranscriptionResult> {
  console.log(`[VOICE] Starting transcription for file: ${fileId}`);

  // Step 1: Get file path from Telegram
  const filePath = await getTelegramFilePath(fileId);
  if (!filePath) {
    return {
      success: false,
      error: "Could not get voice file from Telegram",
    };
  }

  console.log(`[VOICE] Got file path: ${filePath}`);

  // Step 2: Download the audio file
  const audioBuffer = await downloadTelegramFile(filePath);
  if (!audioBuffer) {
    return {
      success: false,
      error: "Could not download voice file",
    };
  }

  console.log(`[VOICE] Downloaded ${audioBuffer.byteLength} bytes`);

  // Step 3: Transcribe with Groq
  const fileName = filePath.split("/").pop() || "voice.ogg";
  const result = await transcribeWithGroq(audioBuffer, fileName);

  if (result.success) {
    console.log(`[VOICE] Transcribed: "${result.text?.substring(0, 50)}..."`);
  } else {
    console.error(`[VOICE] Transcription failed: ${result.error}`);
  }

  return result;
}

/**
 * Check if Groq API is configured
 */
export function isVoiceEnabled(): boolean {
  return !!GROQ_API_KEY;
}

/**
 * Format transcription for user feedback
 */
export function formatTranscriptionFeedback(text: string): string {
  const truncated = text.length > 100 ? text.substring(0, 100) + "..." : text;
  return `Heard: "${truncated}"`;
}
