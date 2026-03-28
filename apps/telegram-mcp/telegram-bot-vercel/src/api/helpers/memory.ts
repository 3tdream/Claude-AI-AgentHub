import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";

// Configuration
const MAX_MEMORY_MB = 20;
const MAX_HISTORY_PER_CHAT = 20;
const MEMORY_FILE = path.join(process.cwd(), "data", "memory.json");

// Upstash Free Tier Limits
const UPSTASH_FREE_LIMITS = {
  maxDataMB: 256,        // 256 MB max data
  maxBandwidthGB: 10,    // 10 GB monthly bandwidth
  warningThreshold: 0.9, // 90% warning threshold
};

// Use Redis in production, JSON file in development
const IS_PRODUCTION = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

// Initialize Redis if in production
let redis: Redis | null = null;
if (IS_PRODUCTION && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatMemory {
  messages: Message[];
  userName?: string;
  lastActivity: number;
}

export interface MemoryData {
  chats: Record<string, ChatMemory>;
  metadata: {
    createdAt: number;
    lastUpdated: number;
    totalMessages: number;
  };
}

// ==================== LOCAL JSON STORAGE ====================

function ensureDataDir(): void {
  // Skip in production - filesystem is read-only in Vercel
  if (IS_PRODUCTION) return;

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadMemoryLocal(): MemoryData {
  // In production, local storage isn't available
  if (IS_PRODUCTION) {
    return {
      chats: {},
      metadata: { createdAt: Date.now(), lastUpdated: Date.now(), totalMessages: 0 },
    };
  }

  ensureDataDir();

  if (!fs.existsSync(MEMORY_FILE)) {
    const initialData: MemoryData = {
      chats: {},
      metadata: {
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        totalMessages: 0,
      },
    };
    saveMemoryLocal(initialData);
    return initialData;
  }

  try {
    const data = fs.readFileSync(MEMORY_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("[MEMORY] Error reading memory file:", error);
    return {
      chats: {},
      metadata: { createdAt: Date.now(), lastUpdated: Date.now(), totalMessages: 0 },
    };
  }
}

function saveMemoryLocal(data: MemoryData): void {
  // In production, local storage isn't available
  if (IS_PRODUCTION) return;

  ensureDataDir();
  data.metadata.lastUpdated = Date.now();
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("[MEMORY] Error writing memory file:", error);
  }
}

function getMemorySizeLocal(): number {
  if (!fs.existsSync(MEMORY_FILE)) return 0;
  const stats = fs.statSync(MEMORY_FILE);
  return stats.size / (1024 * 1024);
}

// ==================== REDIS STORAGE ====================

async function getChatFromRedis(chatId: string): Promise<ChatMemory | null> {
  if (!redis) return null;
  try {
    const data = await redis.get<ChatMemory>(`chat:${chatId}`);
    return data;
  } catch (error) {
    console.error("[REDIS] Error getting chat:", error);
    return null;
  }
}

async function saveChatToRedis(chatId: string, chat: ChatMemory): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(`chat:${chatId}`, chat);
    // Update stats
    await redis.incr("stats:totalMessages");
  } catch (error) {
    console.error("[REDIS] Error saving chat:", error);
  }
}

async function deleteChatFromRedis(chatId: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(`chat:${chatId}`);
  } catch (error) {
    console.error("[REDIS] Error deleting chat:", error);
  }
}

async function getRedisMemoryStats(): Promise<{ totalChats: number; totalMessages: number; sizeMB: number }> {
  if (!redis) return { totalChats: 0, totalMessages: 0, sizeMB: 0 };
  try {
    const keys = await redis.keys("chat:*");
    const totalMessages = await redis.get<number>("stats:totalMessages") || 0;
    return {
      totalChats: keys.length,
      totalMessages,
      sizeMB: 0,
    };
  } catch (error) {
    console.error("[REDIS] Error getting stats:", error);
    return { totalChats: 0, totalMessages: 0, sizeMB: 0 };
  }
}

// ==================== UPSTASH USAGE MONITORING ====================

export interface UpstashUsage {
  dataUsedMB: number;
  dataLimitMB: number;
  dataPercentage: number;
  bandwidthUsedGB: number;
  bandwidthLimitGB: number;
  bandwidthPercentage: number;
  warnings: string[];
}

export async function checkUpstashUsage(): Promise<UpstashUsage | null> {
  if (!IS_PRODUCTION || !redis) return null;

  const UPSTASH_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
  const UPSTASH_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!UPSTASH_REST_URL || !UPSTASH_REST_TOKEN) return null;

  try {
    // Get database info from Upstash REST API
    // The /info endpoint returns Redis INFO command output
    const response = await fetch(`${UPSTASH_REST_URL}/info`, {
      headers: {
        Authorization: `Bearer ${UPSTASH_REST_TOKEN}`,
      },
    });

    const data = await response.json();

    // Parse memory info from Redis INFO output
    let dataUsedMB = 0;
    if (data.result) {
      const infoString = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
      const memoryMatch = infoString.match(/used_memory:(\d+)/);
      if (memoryMatch) {
        dataUsedMB = parseInt(memoryMatch[1]) / (1024 * 1024);
      }
    }

    // Get monthly bandwidth from Upstash stats endpoint (if available)
    // Note: Upstash shows this in dashboard, API access may be limited
    // For now, we'll track our own estimate based on requests
    const bandwidthUsedGB = (await redis.get<number>("stats:bandwidthBytes") || 0) / (1024 * 1024 * 1024);

    const dataPercentage = (dataUsedMB / UPSTASH_FREE_LIMITS.maxDataMB) * 100;
    const bandwidthPercentage = (bandwidthUsedGB / UPSTASH_FREE_LIMITS.maxBandwidthGB) * 100;

    const warnings: string[] = [];

    if (dataPercentage >= UPSTASH_FREE_LIMITS.warningThreshold * 100) {
      warnings.push(
        `⚠️ DATA LIMIT: ${dataUsedMB.toFixed(1)}MB / ${UPSTASH_FREE_LIMITS.maxDataMB}MB (${dataPercentage.toFixed(1)}%)`
      );
    }

    if (bandwidthPercentage >= UPSTASH_FREE_LIMITS.warningThreshold * 100) {
      warnings.push(
        `⚠️ BANDWIDTH LIMIT: ${bandwidthUsedGB.toFixed(2)}GB / ${UPSTASH_FREE_LIMITS.maxBandwidthGB}GB (${bandwidthPercentage.toFixed(1)}%)`
      );
    }

    return {
      dataUsedMB,
      dataLimitMB: UPSTASH_FREE_LIMITS.maxDataMB,
      dataPercentage,
      bandwidthUsedGB,
      bandwidthLimitGB: UPSTASH_FREE_LIMITS.maxBandwidthGB,
      bandwidthPercentage,
      warnings,
    };
  } catch (error) {
    console.error("[UPSTASH] Error checking usage:", error);
    return null;
  }
}

// Track bandwidth usage (approximate)
export async function trackBandwidth(bytes: number): Promise<void> {
  if (!IS_PRODUCTION || !redis) return;
  try {
    await redis.incrby("stats:bandwidthBytes", bytes);
  } catch (error) {
    console.error("[REDIS] Error tracking bandwidth:", error);
  }
}

// Reset monthly bandwidth counter (call on 1st of each month)
export async function resetMonthlyBandwidth(): Promise<void> {
  if (!IS_PRODUCTION || !redis) return;
  try {
    await redis.set("stats:bandwidthBytes", 0);
    await redis.set("stats:bandwidthResetDate", new Date().toISOString());
  } catch (error) {
    console.error("[REDIS] Error resetting bandwidth:", error);
  }
}

// ==================== UNIFIED API ====================

export function checkMemoryLimit(): { isWarning: boolean; sizeMB: number; message: string } {
  if (IS_PRODUCTION) {
    // Redis has its own limits managed by Upstash
    return { isWarning: false, sizeMB: 0, message: "Using Redis storage" };
  }

  const sizeMB = getMemorySizeLocal();
  const isWarning = sizeMB >= MAX_MEMORY_MB;

  return {
    isWarning,
    sizeMB: Math.round(sizeMB * 100) / 100,
    message: isWarning
      ? `WARNING: Memory file is ${sizeMB.toFixed(2)}MB (limit: ${MAX_MEMORY_MB}MB)`
      : `Memory: ${sizeMB.toFixed(2)}MB / ${MAX_MEMORY_MB}MB`,
  };
}

export async function getChatHistory(chatId: string): Promise<Message[]> {
  if (IS_PRODUCTION && redis) {
    const chat = await getChatFromRedis(chatId);
    return chat?.messages || [];
  }

  const memory = loadMemoryLocal();
  return memory.chats[chatId]?.messages || [];
}

export async function addMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string,
  userName?: string
): Promise<{ history: Message[]; memoryWarning: string | null }> {
  const newMessage: Message = {
    role,
    content,
    timestamp: Date.now(),
  };

  if (IS_PRODUCTION && redis) {
    // Redis storage
    let chat = await getChatFromRedis(chatId);

    if (!chat) {
      chat = {
        messages: [],
        userName,
        lastActivity: Date.now(),
      };
    }

    chat.messages.push(newMessage);

    // Trim history
    if (chat.messages.length > MAX_HISTORY_PER_CHAT) {
      chat.messages = chat.messages.slice(-MAX_HISTORY_PER_CHAT);
    }

    chat.lastActivity = Date.now();
    if (userName) chat.userName = userName;

    await saveChatToRedis(chatId, chat);

    return { history: chat.messages, memoryWarning: null };
  }

  // Local JSON storage
  const memory = loadMemoryLocal();

  if (!memory.chats[chatId]) {
    memory.chats[chatId] = {
      messages: [],
      userName,
      lastActivity: Date.now(),
    };
  }

  const chat = memory.chats[chatId];
  chat.messages.push(newMessage);

  if (chat.messages.length > MAX_HISTORY_PER_CHAT) {
    chat.messages = chat.messages.slice(-MAX_HISTORY_PER_CHAT);
  }

  chat.lastActivity = Date.now();
  if (userName) chat.userName = userName;
  memory.metadata.totalMessages++;

  saveMemoryLocal(memory);

  const memoryCheck = checkMemoryLimit();
  return {
    history: chat.messages,
    memoryWarning: memoryCheck.isWarning ? memoryCheck.message : null,
  };
}

export async function clearChatHistory(chatId: string): Promise<void> {
  if (IS_PRODUCTION && redis) {
    await deleteChatFromRedis(chatId);
    return;
  }

  const memory = loadMemoryLocal();
  if (memory.chats[chatId]) {
    memory.chats[chatId].messages = [];
    memory.chats[chatId].lastActivity = Date.now();
    saveMemoryLocal(memory);
  }
}

export async function getMemoryStats(): Promise<{
  totalChats: number;
  totalMessages: number;
  sizeMB: number;
  storage: string;
}> {
  if (IS_PRODUCTION && redis) {
    const stats = await getRedisMemoryStats();
    return { ...stats, storage: "Redis (Upstash)" };
  }

  const memory = loadMemoryLocal();
  const chatIds = Object.keys(memory.chats);
  let totalMessages = 0;

  for (const chatId of chatIds) {
    totalMessages += memory.chats[chatId].messages.length;
  }

  return {
    totalChats: chatIds.length,
    totalMessages,
    sizeMB: getMemorySizeLocal(),
    storage: "Local JSON",
  };
}

export async function cleanupOldChats(daysOld: number = 30): Promise<number> {
  if (IS_PRODUCTION && redis) {
    // Redis cleanup would need TTL or manual iteration
    console.log("[REDIS] Cleanup not implemented for Redis yet");
    return 0;
  }

  const memory = loadMemoryLocal();
  const cutoff = Date.now() - daysOld * 24 * 60 * 60 * 1000;
  let deleted = 0;

  for (const chatId of Object.keys(memory.chats)) {
    if (memory.chats[chatId].lastActivity < cutoff) {
      delete memory.chats[chatId];
      deleted++;
    }
  }

  if (deleted > 0) {
    saveMemoryLocal(memory);
  }

  return deleted;
}
