import { NextRequest, NextResponse } from 'next/server';
import { JiraClient } from '@/lib/jira/api';
import { setJiraCredentials } from '@/lib/jira/auth';
import type { JiraConfig } from '@/lib/jira/types';

export async function POST(request: NextRequest) {
  try {
    const config: JiraConfig = await request.json();

    // Validate required fields
    if (!config.domain || !config.email || !config.apiToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Test connection
    const client = new JiraClient(config);
    const result = await client.testConnection();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to connect to Jira' },
        { status: 401 }
      );
    }

    // Store credentials in HTTP-only cookie
    await setJiraCredentials(config);

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    console.error('Jira connection error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Connection failed' },
      { status: 500 }
    );
  }
}
