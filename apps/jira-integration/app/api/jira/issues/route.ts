import { NextRequest, NextResponse } from 'next/server';
import { createJiraClient } from '@/lib/jira/api';
import { getJiraConfig } from '@/lib/jira/auth';

export async function GET(request: NextRequest) {
  try {
    const config = await getJiraConfig();

    if (!config) {
      return NextResponse.json(
        { error: 'Jira not configured. Please connect to Jira first.' },
        { status: 401 }
      );
    }

    const client = createJiraClient(config);
    const searchParams = request.nextUrl.searchParams;
    const jql = searchParams.get('jql') || 'ORDER BY updated DESC';
    const maxResults = parseInt(searchParams.get('maxResults') || '50', 10);

    const result = await client.searchIssues(jql, { maxResults });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await getJiraConfig();

    if (!config) {
      return NextResponse.json(
        { error: 'Jira not configured. Please connect first.' },
        { status: 401 }
      );
    }

    const client = createJiraClient(config);
    const payload = await request.json();

    const issue = await client.createIssue(payload);

    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create issue' },
      { status: 500 }
    );
  }
}
