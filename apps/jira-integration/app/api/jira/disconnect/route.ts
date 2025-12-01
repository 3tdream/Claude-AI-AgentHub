import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'jira_config';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Delete the jira config cookie
    cookieStore.delete(COOKIE_NAME);

    return NextResponse.json({ success: true, message: 'Disconnected from Jira' });
  } catch (error) {
    console.error('Error disconnecting:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
