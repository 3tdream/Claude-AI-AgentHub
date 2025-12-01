import { NextResponse } from 'next/server';
import { getJiraConfig } from '@/lib/jira/auth';

export async function GET() {
  try {
    const config = await getJiraConfig();

    if (!config) {
      return NextResponse.json(
        { error: 'Not connected to Jira' },
        { status: 401 }
      );
    }

    // Return only the email (not the token for security)
    return NextResponse.json({
      email: config.email,
      domain: config.domain,
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    return NextResponse.json(
      { error: 'Failed to get user info' },
      { status: 500 }
    );
  }
}
