import { cookies } from 'next/headers';
import type { JiraConfig } from './types';

const COOKIE_NAME = 'jira_config';

// Encode config to base64 (in production, use proper encryption)
function encodeConfig(config: JiraConfig): string {
  return Buffer.from(JSON.stringify(config)).toString('base64');
}

// Decode config from base64
function decodeConfig(encoded: string): JiraConfig | null {
  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// Store credentials in HTTP-only cookie
export async function setJiraCredentials(config: JiraConfig): Promise<void> {
  const cookieStore = await cookies();
  const encoded = encodeConfig(config);

  cookieStore.set(COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

// Get credentials from cookie
export async function getJiraCredentials(): Promise<JiraConfig | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

  if (!cookie?.value) {
    return null;
  }

  return decodeConfig(cookie.value);
}

// Clear credentials cookie
export async function clearJiraCredentials(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Get config from cookie OR environment variables (cookie takes priority)
export async function getJiraConfig(): Promise<JiraConfig | null> {
  // First try cookie
  const cookieConfig = await getJiraCredentials();
  if (cookieConfig) {
    return cookieConfig;
  }

  // Fall back to env variables
  const domain = process.env.JIRA_DOMAIN;
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;

  if (domain && email && apiToken) {
    return { domain, email, apiToken };
  }

  return null;
}
