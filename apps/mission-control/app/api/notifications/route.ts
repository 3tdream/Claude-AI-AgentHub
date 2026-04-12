import { NextRequest, NextResponse } from 'next/server';
import { getNotifications, saveNotification, markAllRead } from '@/lib/notifications-storage';
import type { NotificationEntry, NotificationType } from '@/types/workflow';

const VALID_TYPES: NotificationType[] = [
  'pipeline_completed',
  'pipeline_failed',
  'pipeline_escalated',
];

const TITLES: Record<NotificationType, string> = {
  pipeline_completed: 'Pipeline completed',
  pipeline_failed: 'Pipeline failed',
  pipeline_escalated: 'Pipeline escalated',
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 200);

    const all = await getNotifications();
    const unreadCount = all.filter((n) => !n.read).length;
    const filtered = unreadOnly ? all.filter((n) => !n.read) : all;
    const data = filtered.slice(0, limit);

    return NextResponse.json({ data, unreadCount });
  } catch {
    return NextResponse.json({ data: [], unreadCount: 0, cached: true }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, executionId, workflowName, message } = body;

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'invalid_type' }, { status: 400 });
    }
    if (!executionId || typeof executionId !== 'string') {
      return NextResponse.json({ error: 'missing_executionId' }, { status: 400 });
    }
    if (!workflowName || typeof workflowName !== 'string') {
      return NextResponse.json({ error: 'missing_workflowName' }, { status: 400 });
    }
    if (typeof message !== 'string' || message.length > 500) {
      return NextResponse.json({ error: 'message_too_long' }, { status: 400 });
    }

    const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const entry: NotificationEntry = {
      id,
      type: type as NotificationType,
      title: TITLES[type as NotificationType],
      message: message.slice(0, 500),
      executionId,
      workflowName,
      read: false,
      createdAt: new Date().toISOString(),
    };

    await saveNotification(entry);
    return NextResponse.json({ id, ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'storage_error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (body?.readAll !== true) {
      return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
    }
    const updated = await markAllRead();
    return NextResponse.json({ ok: true, updated });
  } catch {
    return NextResponse.json({ error: 'storage_error' }, { status: 500 });
  }
}
