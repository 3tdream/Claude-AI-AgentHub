import { Redis } from "@upstash/redis";

const IS_PRODUCTION = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

let redis: Redis | null = null;
if (IS_PRODUCTION && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// ==================== TYPES ====================

export interface AutoReplyRule {
  id: string;
  trigger: string;        // Keyword or regex pattern
  triggerType: "keyword" | "regex" | "mention";
  response: string;       // Response text or "ai" for AI-generated
  enabled: boolean;
  cooldownSeconds: number; // Prevent spam, 0 = no cooldown
  lastTriggered?: number;
}

export interface ModerationRule {
  id: string;
  type: "spam" | "language" | "links" | "caps" | "custom";
  action: "warn" | "delete" | "mute" | "kick" | "ban";
  pattern?: string;       // For custom rules
  threshold?: number;     // For spam (messages per minute)
  enabled: boolean;
}

export interface GroupConfig {
  groupId: string;
  groupName: string;
  enabled: boolean;

  // Features
  autoReplyEnabled: boolean;
  moderationEnabled: boolean;
  summariesEnabled: boolean;

  // Auto-reply settings
  autoReplyRules: AutoReplyRule[];
  respondToMentions: boolean;  // Reply when bot is @mentioned
  aiResponseEnabled: boolean;  // Use Claude for intelligent replies

  // Moderation settings
  moderationRules: ModerationRule[];
  warnBeforeAction: boolean;
  maxWarnings: number;

  // Summary settings
  summarySchedule: string;     // Cron expression or "daily", "weekly"
  summaryLanguage: string;     // Language for summaries

  // Admins (Telegram user IDs who can configure)
  adminUserIds: string[];

  // Stats
  messagesProcessed: number;
  actionsPerformed: number;
  lastActivity: number;
  createdAt: number;
}

// ==================== DEFAULT CONFIG ====================

export function getDefaultGroupConfig(groupId: string, groupName: string): GroupConfig {
  return {
    groupId,
    groupName,
    enabled: true,

    autoReplyEnabled: true,
    moderationEnabled: true,
    summariesEnabled: true,

    autoReplyRules: [
      {
        id: "default-hello",
        trigger: "hello|hi|hey",
        triggerType: "regex",
        response: "ai",  // Let AI respond
        enabled: true,
        cooldownSeconds: 60,
      },
    ],
    respondToMentions: true,
    aiResponseEnabled: true,

    moderationRules: [
      {
        id: "spam-detection",
        type: "spam",
        action: "warn",
        threshold: 5,  // 5 messages per minute
        enabled: true,
      },
      {
        id: "caps-lock",
        type: "caps",
        action: "warn",
        threshold: 70, // 70% caps
        enabled: true,
      },
      {
        id: "bad-language",
        type: "language",
        action: "delete",
        enabled: true,
      },
    ],
    warnBeforeAction: true,
    maxWarnings: 3,

    summarySchedule: "daily",
    summaryLanguage: "en",

    adminUserIds: [],

    messagesProcessed: 0,
    actionsPerformed: 0,
    lastActivity: Date.now(),
    createdAt: Date.now(),
  };
}

// ==================== GROUP CONFIG CRUD ====================

export async function getGroupConfig(groupId: string): Promise<GroupConfig | null> {
  if (!redis) return null;

  try {
    const config = await redis.get<GroupConfig>(`group:${groupId}:config`);
    return config;
  } catch (error) {
    console.error("[GROUPS] Error getting config:", error);
    return null;
  }
}

export async function saveGroupConfig(config: GroupConfig): Promise<void> {
  if (!redis) return;

  try {
    config.lastActivity = Date.now();
    await redis.set(`group:${config.groupId}:config`, config);
  } catch (error) {
    console.error("[GROUPS] Error saving config:", error);
  }
}

export async function getOrCreateGroupConfig(
  groupId: string,
  groupName: string,
  adminUserId?: string
): Promise<GroupConfig> {
  let config = await getGroupConfig(groupId);

  if (!config) {
    config = getDefaultGroupConfig(groupId, groupName);
    if (adminUserId) {
      config.adminUserIds.push(adminUserId);
    }
    await saveGroupConfig(config);
  }

  return config;
}

export async function updateGroupConfig(
  groupId: string,
  updates: Partial<GroupConfig>
): Promise<GroupConfig | null> {
  const config = await getGroupConfig(groupId);
  if (!config) return null;

  const updated = { ...config, ...updates, lastActivity: Date.now() };
  await saveGroupConfig(updated);
  return updated;
}

export async function deleteGroupConfig(groupId: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(`group:${groupId}:config`);
    await redis.del(`group:${groupId}:messages`);
    await redis.del(`group:${groupId}:warnings`);
  } catch (error) {
    console.error("[GROUPS] Error deleting config:", error);
  }
}

// ==================== ADMIN CHECKS ====================

export function isGroupAdmin(config: GroupConfig, userId: string): boolean {
  return config.adminUserIds.includes(userId);
}

export async function addGroupAdmin(groupId: string, userId: string): Promise<boolean> {
  const config = await getGroupConfig(groupId);
  if (!config) return false;

  if (!config.adminUserIds.includes(userId)) {
    config.adminUserIds.push(userId);
    await saveGroupConfig(config);
  }
  return true;
}

export async function removeGroupAdmin(groupId: string, userId: string): Promise<boolean> {
  const config = await getGroupConfig(groupId);
  if (!config) return false;

  config.adminUserIds = config.adminUserIds.filter(id => id !== userId);
  await saveGroupConfig(config);
  return true;
}

// ==================== LIST GROUPS ====================

export async function listAllGroups(): Promise<GroupConfig[]> {
  if (!redis) return [];

  try {
    const keys = await redis.keys("group:*:config");
    const groups: GroupConfig[] = [];

    for (const key of keys) {
      const config = await redis.get<GroupConfig>(key);
      if (config) {
        groups.push(config);
      }
    }

    return groups.sort((a, b) => b.lastActivity - a.lastActivity);
  } catch (error) {
    console.error("[GROUPS] Error listing groups:", error);
    return [];
  }
}

// ==================== AUTO-REPLY RULES ====================

export async function addAutoReplyRule(
  groupId: string,
  rule: Omit<AutoReplyRule, "id">
): Promise<string | null> {
  const config = await getGroupConfig(groupId);
  if (!config) return null;

  const id = `rule-${Date.now()}`;
  config.autoReplyRules.push({ ...rule, id });
  await saveGroupConfig(config);
  return id;
}

export async function removeAutoReplyRule(groupId: string, ruleId: string): Promise<boolean> {
  const config = await getGroupConfig(groupId);
  if (!config) return false;

  config.autoReplyRules = config.autoReplyRules.filter(r => r.id !== ruleId);
  await saveGroupConfig(config);
  return true;
}

export async function toggleAutoReplyRule(
  groupId: string,
  ruleId: string,
  enabled: boolean
): Promise<boolean> {
  const config = await getGroupConfig(groupId);
  if (!config) return false;

  const rule = config.autoReplyRules.find(r => r.id === ruleId);
  if (rule) {
    rule.enabled = enabled;
    await saveGroupConfig(config);
    return true;
  }
  return false;
}

// ==================== MODERATION RULES ====================

export async function addModerationRule(
  groupId: string,
  rule: Omit<ModerationRule, "id">
): Promise<string | null> {
  const config = await getGroupConfig(groupId);
  if (!config) return null;

  const id = `mod-${Date.now()}`;
  config.moderationRules.push({ ...rule, id });
  await saveGroupConfig(config);
  return id;
}

export async function removeModerationRule(groupId: string, ruleId: string): Promise<boolean> {
  const config = await getGroupConfig(groupId);
  if (!config) return false;

  config.moderationRules = config.moderationRules.filter(r => r.id !== ruleId);
  await saveGroupConfig(config);
  return true;
}

// ==================== STATS ====================

export async function incrementGroupStats(
  groupId: string,
  field: "messagesProcessed" | "actionsPerformed"
): Promise<void> {
  const config = await getGroupConfig(groupId);
  if (!config) return;

  config[field]++;
  config.lastActivity = Date.now();
  await saveGroupConfig(config);
}
