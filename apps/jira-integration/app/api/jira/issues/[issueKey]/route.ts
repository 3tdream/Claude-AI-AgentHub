import { NextRequest, NextResponse } from 'next/server';
import { createJiraClient } from '@/lib/jira/api';
import { getJiraConfig } from '@/lib/jira/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ issueKey: string }> }
) {
  try {
    const config = await getJiraConfig();
    const { issueKey } = await params;

    if (!config) {
      return NextResponse.json(
        { error: 'Jira not configured' },
        { status: 401 }
      );
    }

    const client = createJiraClient(config);
    const issue = await client.getIssue(issueKey);

    return NextResponse.json(issue);
  } catch (error) {
    console.error('Error fetching issue:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch issue' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ issueKey: string }> }
) {
  try {
    const config = await getJiraConfig();
    const { issueKey } = await params;

    if (!config) {
      return NextResponse.json(
        { error: 'Jira not configured' },
        { status: 401 }
      );
    }

    const client = createJiraClient(config);
    const payload = await request.json();

    await client.updateIssue(issueKey, payload);

    // Return updated issue
    const issue = await client.getIssue(issueKey);

    return NextResponse.json(issue);
  } catch (error) {
    console.error('Error updating issue:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update issue' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ issueKey: string }> }
) {
  try {
    const config = await getJiraConfig();
    const { issueKey } = await params;

    if (!config) {
      return NextResponse.json(
        { error: 'Jira not configured' },
        { status: 401 }
      );
    }

    const client = createJiraClient(config);
    await client.deleteIssue(issueKey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting issue:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete issue' },
      { status: 500 }
    );
  }
}
