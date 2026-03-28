import { Redis } from "@upstash/redis";

// Use Redis in production
const IS_PRODUCTION = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

// Initialize Redis
let redis: Redis | null = null;
if (IS_PRODUCTION && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// ==================== USER DATA TYPES ====================

export interface TelegramUser {
  id: number;
  username?: string;
  firstName: string;
  lastName?: string;
  languageCode?: string;
  isPremium?: boolean;
  isBot?: boolean;
}

export interface UserData {
  // Basic Telegram info
  userId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  languageCode?: string;
  isPremium?: boolean;

  // Tracking info
  firstSeen: number;
  lastSeen: number;
  messageCount: number;

  // Chat context
  chatType: "private" | "group" | "supergroup";
  chatId: number;
  chatTitle?: string;

  // Conversation state
  lastMessage?: string;
  lastResponse?: string;
  conversationActive: boolean;
}

export interface AllUsersStats {
  totalUsers: number;
  activeToday: number;
  activeThisWeek: number;
  users: UserData[];
}

// ==================== USER TRACKING FUNCTIONS ====================

export interface TrackUserResult {
  userData: UserData;
  isNewUser: boolean;
}

/**
 * Track or update a user when they interact with the bot
 */
export async function trackUser(
  user: TelegramUser,
  chatId: number,
  chatType: string,
  chatTitle?: string,
  message?: string
): Promise<TrackUserResult> {
  const userId = user.id.toString();
  const key = `user:${userId}`;

  if (!redis) {
    console.log("[USERS] Redis not available, user tracking disabled");
    return { userData: createUserData(user, chatId, chatType, chatTitle, message), isNewUser: false };
  }

  try {
    // Get existing user data
    let userData = await redis.get<UserData>(key);
    let isNewUser = false;

    const now = Date.now();

    if (userData) {
      // Update existing user
      userData = {
        ...userData,
        // Update basic info (may have changed)
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        languageCode: user.languageCode,
        isPremium: user.isPremium,
        // Update tracking
        lastSeen: now,
        messageCount: userData.messageCount + 1,
        // Update context
        chatType: chatType as "private" | "group" | "supergroup",
        chatId,
        chatTitle,
        lastMessage: message,
        conversationActive: true,
      };
    } else {
      // Create new user
      userData = createUserData(user, chatId, chatType, chatTitle, message);
      isNewUser = true;

      // Add to user index
      await redis.sadd("users:all", userId);
    }

    // Save user data
    await redis.set(key, userData);

    // Update active users index (by day)
    const today = new Date().toISOString().split('T')[0];
    await redis.sadd(`users:active:${today}`, userId);

    console.log(`[USERS] Tracked user ${user.firstName} (${userId}), total messages: ${userData.messageCount}${isNewUser ? ' [NEW USER]' : ''}`);

    return { userData, isNewUser };
  } catch (error) {
    console.error("[USERS] Error tracking user:", error);
    return { userData: createUserData(user, chatId, chatType, chatTitle, message), isNewUser: false };
  }
}

/**
 * Create initial user data object
 */
function createUserData(
  user: TelegramUser,
  chatId: number,
  chatType: string,
  chatTitle?: string,
  message?: string
): UserData {
  const now = Date.now();
  return {
    userId: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    languageCode: user.languageCode,
    isPremium: user.isPremium,
    firstSeen: now,
    lastSeen: now,
    messageCount: 1,
    chatType: chatType as "private" | "group" | "supergroup",
    chatId,
    chatTitle,
    lastMessage: message,
    conversationActive: true,
  };
}

/**
 * Update user's last response from the bot
 */
export async function updateUserLastResponse(userId: number, response: string): Promise<void> {
  if (!redis) return;

  const key = `user:${userId}`;

  try {
    const userData = await redis.get<UserData>(key);
    if (userData) {
      userData.lastResponse = response.substring(0, 500); // Truncate to save space
      await redis.set(key, userData);
    }
  } catch (error) {
    console.error("[USERS] Error updating last response:", error);
  }
}

/**
 * Get a specific user's data
 */
export async function getUser(userId: number): Promise<UserData | null> {
  if (!redis) return null;

  try {
    return await redis.get<UserData>(`user:${userId}`);
  } catch (error) {
    console.error("[USERS] Error getting user:", error);
    return null;
  }
}

/**
 * Get all tracked users
 */
export async function getAllUsers(): Promise<UserData[]> {
  if (!redis) return [];

  try {
    // Get all user IDs
    const userIds = await redis.smembers("users:all");

    if (!userIds || userIds.length === 0) return [];

    // Get all user data
    const users: UserData[] = [];

    for (const userId of userIds) {
      const userData = await redis.get<UserData>(`user:${userId}`);
      if (userData) {
        users.push(userData);
      }
    }

    // Sort by last seen (most recent first)
    users.sort((a, b) => b.lastSeen - a.lastSeen);

    return users;
  } catch (error) {
    console.error("[USERS] Error getting all users:", error);
    return [];
  }
}

/**
 * Get users statistics
 */
export async function getUsersStats(): Promise<AllUsersStats> {
  if (!redis) {
    return { totalUsers: 0, activeToday: 0, activeThisWeek: 0, users: [] };
  }

  try {
    const users = await getAllUsers();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;

    const activeToday = users.filter(u => now - u.lastSeen < dayMs).length;
    const activeThisWeek = users.filter(u => now - u.lastSeen < weekMs).length;

    return {
      totalUsers: users.length,
      activeToday,
      activeThisWeek,
      users,
    };
  } catch (error) {
    console.error("[USERS] Error getting stats:", error);
    return { totalUsers: 0, activeToday: 0, activeThisWeek: 0, users: [] };
  }
}

/**
 * Format users list for Telegram message
 */
export function formatUsersForTelegram(stats: AllUsersStats): string {
  const lines: string[] = [
    `*User Statistics*`,
    ``,
    `Total Users: ${stats.totalUsers}`,
    `Active Today: ${stats.activeToday}`,
    `Active This Week: ${stats.activeThisWeek}`,
    ``,
    `*Recent Users:*`,
  ];

  // Show top 20 most recent users
  const recentUsers = stats.users.slice(0, 20);

  for (const user of recentUsers) {
    const lastSeenDate = new Date(user.lastSeen);
    const timeAgo = getTimeAgo(user.lastSeen);
    const name = user.username ? `@${user.username}` : user.firstName;
    const chatInfo = user.chatType === "private" ? "DM" : (user.chatTitle || "Group");

    lines.push(`- ${name} (${user.messageCount} msgs) - ${timeAgo} - ${chatInfo}`);
  }

  if (stats.users.length > 20) {
    lines.push(`... and ${stats.users.length - 20} more users`);
  }

  return lines.join("\n");
}

/**
 * Get human-readable time ago string
 */
function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/**
 * Mark user conversation as inactive
 */
export async function markUserInactive(userId: number): Promise<void> {
  if (!redis) return;

  try {
    const userData = await redis.get<UserData>(`user:${userId}`);
    if (userData) {
      userData.conversationActive = false;
      await redis.set(`user:${userId}`, userData);
    }
  } catch (error) {
    console.error("[USERS] Error marking user inactive:", error);
  }
}

/**
 * Delete user data (for GDPR compliance)
 */
export async function deleteUser(userId: number): Promise<boolean> {
  if (!redis) return false;

  try {
    await redis.del(`user:${userId}`);
    await redis.srem("users:all", userId.toString());
    return true;
  } catch (error) {
    console.error("[USERS] Error deleting user:", error);
    return false;
  }
}
